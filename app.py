from flask import Flask, render_template, request, jsonify, send_from_directory
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)

# Load ClimateBERT models
commitment_model = AutoModelForSequenceClassification.from_pretrained("climatebert/distilroberta-base-climate-commitment")
specificity_model = AutoModelForSequenceClassification.from_pretrained("climatebert/distilroberta-base-climate-specificity")

commitment_tokenizer = AutoTokenizer.from_pretrained("climatebert/distilroberta-base-climate-commitment")
specificity_tokenizer = AutoTokenizer.from_pretrained("climatebert/distilroberta-base-climate-specificity")

@app.route("/")
def home():
    return render_template("index.html")  # Ensure Flask is correctly serving index.html

# ✅ NEW FUNCTION to serve static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text", "")

    if not text.strip():
        return jsonify({"error": "No text provided"}), 400

    # Process text and calculate scores
    commitment_score = get_score(commitment_model, commitment_tokenizer, text)
    specificity_score = get_score(specificity_model, specificity_tokenizer, text)

    cheap_talk_score = commitment_score * (1 - specificity_score)

    return jsonify({
        "commitment_probability": commitment_score,
        "specificity_probability": specificity_score,
        "cheap_talk_probability": cheap_talk_score
    })

def get_score(model, tokenizer, text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
    return probabilities[0, 1].item()

if __name__ == '__main__':
    app.run(debug=True)
