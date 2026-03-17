import pandas as pd
from preprocessing import clean_text
import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification, AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import os

# Setup paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

# Load roBERTa model and tokenizer
roberta_model_path = os.path.join(parent_dir, 'models', 'roberta_finetuned_model')
roberta_tokenizer = RobertaTokenizer.from_pretrained(roberta_model_path)
roberta_model = RobertaForSequenceClassification.from_pretrained(roberta_model_path)

# Load MentalBERT model and tokenizer (using bert-base-uncased as fallback)
mentalbert_model_path = os.path.join(parent_dir, 'models', 'mentalbert_finetuned_model')
mentalbert_tokenizer = AutoTokenizer.from_pretrained(mentalbert_model_path)
mentalbert_model = AutoModelForSequenceClassification.from_pretrained(mentalbert_model_path)

# Device setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
roberta_model.to(device)
mentalbert_model.to(device)

def predict_sentiment(text):
    cleaned_text = clean_text(text)
    inputs = roberta_tokenizer(
        cleaned_text,
        add_special_tokens=True,
        max_length=128,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )
    inputs = {key: val.to(device) for key, val in inputs.items()}
    roberta_model.eval()
    with torch.no_grad():
        outputs = roberta_model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1).cpu().numpy()[0]
        predicted_label = np.argmax(probabilities)
    label_map = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}
    return label_map[predicted_label], cleaned_text

def predict_category(text):
    cleaned_text = clean_text(text)
    inputs = mentalbert_tokenizer(
        cleaned_text,
        add_special_tokens=True,
        max_length=128,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )
    inputs = {key: val.to(device) for key, val in inputs.items()}
    mentalbert_model.eval()
    with torch.no_grad():
        outputs = mentalbert_model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1).cpu().numpy()[0]
        predicted_label = np.argmax(probabilities)
    label_map = {
        0: 'Depression', 1: 'Anxiety', 2: 'Stress', 3: 'PTSD', 4: 'Social Issues',
        5: 'Self-harm', 6: 'Support Seeking', 7: 'Support Providing', 8: 'Professional Treatment', 9: 'Off-topic'
    }
    return label_map[predicted_label]

# Only execute main code when run directly, not when imported
if __name__ == "__main__":
    # Load Reddit data
    input_csv = 'Reddit-Data-Extractor/Reddit-Data-Extractor/data/user_comments_20251027_201256.csv'
    df = pd.read_csv(input_csv)
    
    # Process each row
    results = []
    for index, row in df.iterrows():
        text = row['text']
        sentiment, cleaned_text = predict_sentiment(text)
        category = predict_category(text) if sentiment == 'Negative' else 'N/A'
        results.append({
            'thread_id': row['thread_id'],
            'thread_title': row['thread_title'],
            'position': row['position'],
            'author': row['author'],
            'text': text,
            'cleaned_text': cleaned_text,
            'sentiment': sentiment,
            'category': category,
            'timestamp': row['timestamp']
        })
    
    # Save results to CSV
    output_csv = 'Reddit-Data-Extractor/Reddit-Data-Extractor/data/analyzed_user_comments.csv'
    results_df = pd.DataFrame(results)
    results_df.to_csv(output_csv, index=False)
    print(f"Analysis complete. Results saved to {output_csv}")