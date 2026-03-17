import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.preprocessing import clean_text

# Suppress FutureWarning for cleaner output
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

# Load the finetuned model and tokenizer
model_path = 'models/mentalbert_finetuned_model'
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Function to predict category for a single text
def predict_category(text, max_length=128, preprocess=True):
    # Preprocess the text if raw
    cleaned_text = clean_text(text) if preprocess else text
    
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

    # Map label to category
    label_map = {
        0: 'Depression', 1: 'Anxiety', 2: 'Stress', 3: 'PTSD', 4: 'Social Issues',
        5: 'Self-harm', 6: 'Support Seeking', 7: 'Support Providing', 8: 'Professional Treatment', 9: 'Off-topic'
    }
    return label_map[predicted_label], probabilities, cleaned_text

# Sample test comments (Reddit-style, raw for preprocessing)
test_comments = [
    "I feel so hopeless and can’t get out of bed. @helpme",
    "My heart races every time I leave the house. https://anxietyhelp.com",
    "Work is overwhelming, I’m so stressed out. #worklife",
    "Loud noises trigger my PTSD episodes from the war.",
    "I feel isolated because of social issues with friends.",
    "I’ve been thinking about hurting myself lately.",
    "Can anyone recommend ways to cope with anxiety? @mentalhealth",
    "You’re not alone, I’ve been through depression too. DM me.",
    "Started therapy today, hoping it helps with my stress.",
    "Just saw a funny meme, totally unrelated! #lol"
]

# Test the model on sample comments
print("Testing finetuned MentalBERT model on sample comments:\n")
for comment in test_comments:
    category, probs, cleaned_text = predict_category(comment, preprocess=True)
    print(f"Original Comment: {comment}")
    print(f"Cleaned Comment: {cleaned_text}")
    print(f"Predicted Category: {category}")
    print(f"Probabilities: {probs}")
    print()

# Function to test a custom input
def test_custom_comment():
    custom_comment = input("Enter a comment to test (or press Enter to skip): ")
    if custom_comment:
        category, probs, cleaned_text = predict_category(custom_comment, preprocess=True)
        print(f"\nOriginal Comment: {custom_comment}")
        print(f"Cleaned Comment: {cleaned_text}")
        print(f"Predicted Category: {category}")
        print(f"Probabilities: {probs}")

# Run custom comment test
if __name__ == "__main__":
    print("\nEnter a custom comment to test the model (or press Enter to skip):")
    test_custom_comment()