import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import RobertaTokenizer, RobertaForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
import numpy as np
from datasets import Dataset as HFDataset
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix, precision_recall_curve, roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create graphs directory if it doesn't exist
os.makedirs('graphs', exist_ok=True)

# Custom Dataset class for roBERTa
class RedditSentimentDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

# Load the cleaned dataset
data = pd.read_csv('data/finetuning/roBERTa.csv')

# Split into train and validation sets
train_texts, val_texts, train_labels, val_labels = train_test_split(
    data['text'].values,
    data['label'].values,
    test_size=0.2,
    random_state=42
)

# Initialize tokenizer and model
tokenizer = RobertaTokenizer.from_pretrained('roberta-base')
model = RobertaForSequenceClassification.from_pretrained(
    'roberta-base',
    num_labels=3  # 0: negative, 1: neutral, 2: positive
)

# Create datasets
train_dataset = RedditSentimentDataset(train_texts, train_labels, tokenizer)
val_dataset = RedditSentimentDataset(val_texts, val_labels, tokenizer)

# Convert to Hugging Face Dataset for Trainer API
train_hf_dataset = HFDataset.from_dict({
    'text': train_texts,
    'label': train_labels
})
val_hf_dataset = HFDataset.from_dict({
    'text': val_texts,
    'label': val_labels
})

# Tokenize datasets
def tokenize_function(examples):
    return tokenizer(
        examples['text'],
        padding='max_length',
        truncation=True,
        max_length=128
    )

train_hf_dataset = train_hf_dataset.map(tokenize_function, batched=True)
val_hf_dataset = val_hf_dataset.map(tokenize_function, batched=True)

# Set format for PyTorch
train_hf_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])
val_hf_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])

# Define training arguments
training_args = TrainingArguments(
    output_dir='models/roberta_finetuned',
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=10,
    eval_strategy='epoch',
    save_strategy='epoch',
    load_best_model_at_end=True,
    metric_for_best_model='f1'
)

# Compute metrics for evaluation
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    accuracy = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1
    }

# Initialize Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_hf_dataset,
    eval_dataset=val_hf_dataset,
    compute_metrics=compute_metrics
)

# Train the model
trainer.train()

# Evaluate and generate graphs
results = trainer.evaluate()
print("Evaluation Results:", results)

# Predict on validation set for graphs
predictions = trainer.predict(val_hf_dataset)
preds = predictions.predictions.argmax(-1)
probs = torch.softmax(torch.tensor(predictions.predictions), dim=-1).numpy()
true_labels = predictions.label_ids

# Confusion Matrix
cm = confusion_matrix(true_labels, preds)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Negative', 'Neutral', 'Positive'], yticklabels=['Negative', 'Neutral', 'Positive'])
plt.title('roBERTa Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('True')
plt.savefig('graphs/roberta_cm.png')
plt.show()

# Precision-Recall Curve
plt.figure(figsize=(8, 6))
for i in range(3):
    precision, recall, _ = precision_recall_curve(true_labels == i, probs[:, i])
    plt.plot(recall, precision, label=f'Class {i} ({"Negative" if i==0 else "Neutral" if i==1 else "Positive"})')
plt.title('Precision-Recall Curve')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.legend()
plt.savefig('graphs/roberta_pr_curve.png')
plt.show()

# ROC Curve
plt.figure(figsize=(8, 6))
for i in range(3):
    fpr, tpr, _ = roc_curve(true_labels == i, probs[:, i])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'Class {i} ({"Negative" if i==0 else "Neutral" if i==1 else "Positive"}) (AUC = {roc_auc:.2f})')
plt.title('ROC Curve')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend()
plt.savefig('graphs/roberta_roc.png')
plt.show()

# Bar Plot for Metrics
metrics = {
    'Accuracy': results['eval_accuracy'],
    'Precision': results['eval_precision'],
    'Recall': results['eval_recall'],
    'F1': results['eval_f1']
}
plt.figure(figsize=(8, 6))
plt.bar(metrics.keys(), metrics.values())
plt.title('roBERTa Metrics')
plt.savefig('graphs/roberta_metrics_bar.png')
plt.show()

# Save the model and tokenizer
model.save_pretrained('models/roberta_finetuned_model')
tokenizer.save_pretrained('models/roberta_finetuned_model')

print("Model and tokenizer saved to 'models/roberta_finetuned_model'")
print("Graphs saved to 'graphs/'")