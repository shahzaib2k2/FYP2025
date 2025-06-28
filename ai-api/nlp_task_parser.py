from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import re
from dateutil import parser as date_parser

app = Flask(__name__)
CORS(app)

nlp = spacy.load("en_core_web_sm")

def extract_task_fields(text):
    doc = nlp(text)
    result = {
        "title": None,
        "priority": "Auto",
        "assignee": None,
        "dueDate": None
    }

    # Priority
    if "high" in text.lower():
        result["priority"] = "High"
    elif "medium" in text.lower():
        result["priority"] = "Medium"
    elif "low" in text.lower():
        result["priority"] = "Low"

    # Assignee
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            result["assignee"] = ent.text

    # Due date
    date_match = re.search(r'due (on|by)? ?(.+)', text.lower())
    if date_match:
        try:
            date_str = date_match.group(2)
            due_date = date_parser.parse(date_str, fuzzy=True)
            result["dueDate"] = due_date.strftime('%Y-%m-%d')
        except:
            pass

    # Title (remove known parts)
    cleaned = re.sub(r'(due .+|assigned to .+|high|medium|low)', '', text, flags=re.I).strip()
    result["title"] = cleaned or "Untitled Task"

    return result

@app.route('/parse-task', methods=['POST'])
def parse_task():
    data = request.json
    text = data.get("text", "")
    if not text.strip():
        return jsonify({"success": False, "error": "Description is required"})
    
    fields = extract_task_fields(text)
    return jsonify({"success": True, "data": fields})

if __name__ == '__main__':
    app.run(port=8001, debug=True)
