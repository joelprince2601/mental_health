import pandas as pd
import torch
from torch.utils.data import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
import numpy as np
from datasets import Dataset as HFDataset
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix, precision_recall_curve, roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create graphs directory if it doesn't exist
os.makedirs('graphs', exist_ok=True)

# Custom Dataset class for MentalBERT
class MentalHealthDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=256):
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
data = pd.read_csv('data/finetuning/mentalBERT.csv')

# Split into train and validation sets
train_texts, val_texts, train_labels, val_labels = train_test_split(
    data['text'].values,
    data['label'].values,
    test_size=0.2,
    random_state=42,
    stratify=data['label']
)

# Initialize tokenizer and model
tokenizer = AutoTokenizer.from_pretrained('mental/mental-bert-base-uncased')
model = AutoModelForSequenceClassification.from_pretrained(
    'mental/mental-bert-base-uncased',
    num_labels=10  # 0: Depression, 1: Anxiety, 2: Stress, 3: PTSD, 4: Social Issues, 5: Self-harm, 6: Support Seeking, 7: Support Providing, 8: Professional Treatment, 9: Off-topic
)

# Create datasets
train_dataset = MentalHealthDataset(train_texts, train_labels, tokenizer)
val_dataset = MentalHealthDataset(val_texts, val_labels, tokenizer)

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
        max_length=256
    )

train_hf_dataset = train_hf_dataset.map(tokenize_function, batched=True)
val_hf_dataset = val_hf_dataset.map(tokenize_function, batched=True)

# Set format for PyTorch
train_hf_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])
val_hf_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])

# Define training arguments
training_args = TrainingArguments(
    output_dir='models/mentalbert_finetuned',
    num_train_epochs=5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=50,
    weight_decay=0.01,
    learning_rate=2e-5,
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

# Define class labels
categories = ['Depression', 'Anxiety', 'Stress', 'PTSD', 'Social Issues', 'Self-harm', 'Support Seeking', 'Support Providing', 'Professional Treatment', 'Off-topic']

# Confusion Matrix
cm = confusion_matrix(true_labels, preds)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=categories, yticklabels=categories)
plt.title('MentalBERT Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('True')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('graphs/mentalbert_cm.png')
plt.show()

# Precision-Recall Curve
plt.figure(figsize=(10, 8))
for i in range(10):
    precision, recall, _ = precision_recall_curve(true_labels == i, probs[:, i])
    plt.plot(recall, precision, label=f'{categories[i]}')
plt.title('Precision-Recall Curve')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.savefig('graphs/mentalbert_pr_curve.png')
plt.show()

# ROC Curve
plt.figure(figsize=(10, 8))
for i in range(10):
    fpr, tpr, _ = roc_curve(true_labels == i, probs[:, i])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'{categories[i]} (AUC = {roc_auc:.2f})')
plt.title('ROC Curve')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.savefig('graphs/mentalbert_roc.png')
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
plt.title('MentalBERT Metrics')
plt.savefig('graphs/mentalbert_metrics_bar.png')
plt.show()

# Save the model and tokenizer
model.save_pretrained('models/mentalbert_finetuned_model')
tokenizer.save_pretrained('models/mentalbert_finetuned_model')

print("Model and tokenizer saved to 'models/mentalbert_finetuned_model'")
print("Graphs saved to 'graphs/'")