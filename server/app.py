from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app) # Allow frontend to communicate with backend

UPLOAD_FOLDER = "uploads"   # Specifies a folder where uploaded files will be saved
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)      # Ensure upload directory exists

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/upload", methods=["POST"])     # API route at /upload that accepts POST requests
def upload_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file provided."}), 400 # Converts the output of a function to a JSON response object

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)    # Generates full file path
    file.save(file_path)

    return jsonify({
        "message": "File uploaded successfully",
        "file_path": file_path})

if __name__ == "__main__":
    app.run(debug=True, port=5000)