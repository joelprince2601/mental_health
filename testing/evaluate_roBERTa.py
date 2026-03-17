import pandas as pd
import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, precision_recall_curve, roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.preprocessing import clean_text

# Load model and tokenizer
model_path = 'models/roberta_finetuned_model'
tokenizer = RobertaTokenizer.from_pretrained(model_path)
model = RobertaForSequenceClassification.from_pretrained(model_path)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

# Load validation data
val_df = pd.read_csv('data/validation_roberta.csv')

# Predict function
def predict(text):
    cleaned = clean_text(text)
    inputs = tokenizer(cleaned, return_tensors='pt', padding=True, truncation=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1).cpu().numpy()[0]
        pred = np.argmax(probs)
    return pred, probs

# Get predictions
preds = []
probs = []
for text in val_df['text']:
    pred, prob = predict(text)
    preds.append(pred)
    probs.append(prob)

true_labels = val_df['label'].values

# Calculate metrics
accuracy = accuracy_score(true_labels, preds)
precision, recall, f1, _ = precision_recall_fscore_support(true_labels, preds, average='weighted')

print(f"Accuracy: {accuracy}")
print(f"Precision: {precision}")
print(f"Recall: {recall}")
print(f"F1: {f1}")

# Confusion Matrix
cm = confusion_matrix(true_labels, preds)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Negative', 'Neutral', 'Positive'], yticklabels=['Negative', 'Neutral', 'Positive'])
plt.title('roBERTa Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('True')
plt.savefig('graphs/roberta_cm.png')
plt.show()

# Precision-Recall Curve (for multi-class, average)
probs_np = np.array(probs)
for i in range(3):
    precision, recall, _ = precision_recall_curve(true_labels == i, probs_np[:, i])
    plt.plot(recall, precision, label=f'Class {i}')

plt.title('Precision-Recall Curve')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.legend()
plt.savefig('graphs/roberta_pr_curve.png')
plt.show()

# ROC Curve
for i in range(3):
    fpr, tpr, _ = roc_curve(true_labels == i, probs_np[:, i])
    plt.plot(fpr, tpr, label=f'Class {i} (AUC = {auc(fpr, tpr):.2f})')

plt.title('ROC Curve')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend()
plt.savefig('graphs/roberta_roc.png')
plt.show()

# Bar Plot for Metrics
metrics = {'Accuracy': accuracy, 'Precision': precision, 'Recall': recall, 'F1': f1}
plt.bar(metrics.keys(), metrics.values())
plt.title('roBERTa Metrics')
plt.savefig('graphs/roberta_metrics_bar.png')
plt.show()