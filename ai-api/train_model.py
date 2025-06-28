
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load dataset
df = pd.read_csv("rich_tasks_dataset.csv")

# Preprocess
df = df[df["completed"] == False]
df["due_date"] = pd.to_datetime(df["due_date"])
df["created_date"] = pd.to_datetime(df["created_date"])
df["days_left"] = (df["due_date"] - datetime.now()).dt.days.clip(lower=0)
df["desc_length"] = df["task_description"].apply(len)

# Encode categorical features
le_type = LabelEncoder()
le_assignee = LabelEncoder()
df["task_type_encoded"] = le_type.fit_transform(df["task_type"])
df["assigned_to_encoded"] = le_assignee.fit_transform(df["assigned_to"])

# Encode target
priority_map = {"Low": 0, "Medium": 1, "High": 2}
df["priority_encoded"] = df["priority"].map(priority_map)

# Features and target
X = df[["days_left", "desc_length", "estimated_hours", "task_type_encoded", "assigned_to_encoded"]]
y = df["priority_encoded"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("✅ Accuracy:", accuracy_score(y_test, y_pred))
print("📋 Classification Report:\n", classification_report(y_test, y_pred, target_names=["Low", "Medium", "High"]))

# Save model
joblib.dump(model, "priority_model.pkl")
print("📦 Model saved as priority_model.pkl")
