import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification
import numpy as np
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.preprocessing import clean_text

# Suppress FutureWarning for cleaner output
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

# Load the finetuned model and tokenizer
model_path = 'models/roberta_finetuned_model'
tokenizer = RobertaTokenizer.from_pretrained(model_path)
model = RobertaForSequenceClassification.from_pretrained(model_path)

# Function to predict sentiment for a single text
def predict_sentiment(text, max_length=128):
    # Preprocess the text
    cleaned_text = clean_text(text)
    
    # Tokenize the cleaned text
    inputs = tokenizer(
        cleaned_text,
        add_special_tokens=True,
        max_length=max_length,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )

    # Move inputs to the same device as the model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    inputs = {key: val.to(device) for key, val in inputs.items()}

    # Set model to evaluation mode
    model.eval()

    # Make prediction
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1).cpu().numpy()[0]
        predicted_label = np.argmax(probabilities)

    # Map label to sentiment
    label_map = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}
    return label_map[predicted_label], probabilities, cleaned_text

# Sample test comments (Reddit-style, raw)
test_comments = [
    "I'm feeling really overwhelmed and can't cope with this stress anymore. Check out https://stress.com",
    "@user123 Just had a regular day, nothing special, just chilling #normalday",
    "I'm so grateful for the support from my friends, feeling on top of the world! <3",
    "Everything seems pointless, I don’t know how to move forward. @helpme",
    "Went for a walk today, it was okay, I guess. 12345 steps."
]

# Test the model on sample comments
print("Testing finetuned roBERTa model on sample comments:\n")
for comment in test_comments:
    sentiment, probs, cleaned_text = predict_sentiment(comment)
    print(f"Original Comment: {comment}")
    print(f"Cleaned Comment: {cleaned_text}")
    print(f"Predicted Sentiment: {sentiment}")
    print(f"Probabilities (Negative, Neutral, Positive): {probs}")
    print()

# Function to test a custom input
def test_custom_comment():
    custom_comment = input("Enter a comment to test (or press Enter to skip): ")
    if custom_comment:
        sentiment, probs, cleaned_text = predict_sentiment(custom_comment)
        print(f"\nOriginal Comment: {custom_comment}")
        print(f"Cleaned Comment: {cleaned_text}")
        print(f"Predicted Sentiment: {sentiment}")
        print(f"Probabilities (Negative, Neutral, Positive): {probs}")

# Run custom comment test
if __name__ == "__main__":
    print("\nEnter a custom comment to test the model (or press Enter to skip):")
    test_custom_comment()