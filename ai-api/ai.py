from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import joblib
import numpy as np
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load("priority_model.pkl")  # Make sure this file exists in the same directory

# Priority label mapping
label_map = {0: 'Low', 1: 'Medium', 2: 'High'}

@app.route('/predict-priority', methods=['POST'])
def predict_priority():
    try:
        # Parse request data
        data = request.get_json()

        # Validate required fields
        required_fields = ["due_date", "description", "estimated_hours", "task_type_encoded", "assigned_to_encoded"]
        for field in required_fields:
            if field not in data:
                abort(400, description=f"Missing required field: {field}")

        # Preprocess input
        due_date = datetime.fromisoformat(data["due_date"].replace("Z", ""))
        days_left = (due_date - datetime.now()).days
        desc_length = len(data["description"])
        estimated_hours = data["estimated_hours"]
        task_type = data["task_type_encoded"]
        assigned_to = data["assigned_to_encoded"]

        # Prepare input vector
        input_vector = np.array([[days_left, desc_length, estimated_hours, task_type, assigned_to]])

        # Predict
        prediction = model.predict(input_vector)[0]

        # Respond with JSON
        return jsonify({
            "priority": label_map[int(prediction)],
            "days_left": int(days_left)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8000)
