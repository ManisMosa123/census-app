
from flask import Flask, request, jsonify, abort
import os
import json
import re

# Create the Flask application
app = Flask(__name__)

# Participant data stored in a global object
participants = {}

# Load admin credentials from a JSON file
def load_admin_credentials():
    try:
        with open('admin_credentials.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {"login": "admin", "password": "P4ssword"}  # Default credentials in case file is not found

ADMIN_CREDENTIALS = load_admin_credentials()

# Basic authentication middleware
@app.before_request
def authenticate():
    auth = request.authorization
    if not auth or auth.username != ADMIN_CREDENTIALS['login'] or auth.password != ADMIN_CREDENTIALS['password']:
        abort(401, description="Authentication Required")

# Validate participant data
def validate_participant_data(data):
    required_fields = ["email", "firstname", "lastname", "dob", "companyname", "salary", "currency", "country", "city"]
    if not all(field in data for field in required_fields):
        return False, "All fields are required."
    if not re.match(r"^\S+@\S+\.\S+$", data["email"]):
        return False, "Invalid email format."
    if not re.match(r"\d{4}-\d{2}-\d{2}", data["dob"]):
        return False, "Date of birth must be in YYYY-MM-DD format."
    return True, ""

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Census Application API. Use the provided endpoints to interact with the system."})


# Endpoint to add a participant
@app.route('/participants/add', methods=['POST'])
def add_participant():
    data = request.get_json()
    valid, message = validate_participant_data(data)
    if not valid:
        return jsonify({"error": message}), 400
    participants[data['email']] = data
    return jsonify({"message": "Participant added successfully"}), 201

# Endpoint to get all participants
@app.route('/participants', methods=['GET'])
def get_participants():
    return jsonify(list(participants.values()))

# Endpoint to get personal details of all participants
@app.route('/participants/details', methods=['GET'])
def get_participants_details():
    details = [{k: v if k in p else "Not provided" for k, v in p.items() if k in ["firstname", "lastname"]} for p in participants.values()]
    return jsonify(details)

# Endpoint to get personal details of a specific participant by email
@app.route('/participants/details/<email>', methods=['GET'])
def get_participant_details(email):
    participant = participants.get(email)
    if not participant:
        return jsonify({"error": "Participant not found"}), 404
    details = {k: v for k, v in participant.items() if k in ["firstname", "lastname"]}
    return jsonify(details)

# Endpoint to get work details of a specific participant by email
@app.route('/participants/work/<email>', methods=['GET'])
def get_participant_work_details(email):
    participant = participants.get(email)
    if not participant:
        return jsonify({"error": "Participant not found"}), 404
    work_details = {k: v for k, v in participant.items() if k in ["companyname", "salary", "currency"]}
    return jsonify(work_details)

# Endpoint to get home details of a specific participant by email
@app.route('/participants/home/<email>', methods=['GET'])
def get_participant_home_details(email):
    participant = participants.get(email)
    if not participant:
        return jsonify({"error": "Participant not found"}), 404
    home_details = {k: v for k, v in participant.items() if k in ["country", "city"]}
    return jsonify(home_details)

# Endpoint to delete a participant
@app.route('/participants/<email>', methods=['DELETE'])
def delete_participant(email):
    if email in participants:
        del participants[email]
        return jsonify({"message": "Participant deleted successfully"}), 200
    return jsonify({"error": "Participant not found"}), 404

# Endpoint to update a participant
@app.route('/participants/<email>', methods=['PUT'])
def update_participant(email):
    if email not in participants:
        return jsonify({"error": "Participant not found"}), 404
    data = request.get_json()
    valid, message = validate_participant_data(data)
    if not valid:
        return jsonify({"error": message}), 400
    participants[email] = data
    return jsonify({"message": "Participant updated successfully"}), 200

# Run the Flask application if the file is the main program
if __name__ == '__main__':
    app.run(debug=True)
