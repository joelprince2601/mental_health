import json
import os

# Create graphs directory
os.makedirs('D:/mental_health/graphs', exist_ok=True)

# Load metrics
def load_metrics(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Metrics file '{file_path}' does not exist.")
    with open(file_path, 'r') as f:
        return json.load(f)

# Extract metrics for plotting
def extract_metrics(metrics):
    epochs = []
    accuracy = []
    precision = []
    recall = []
    f1 = []
    for m in metrics:
        if 'eval_accuracy' in m:
            epochs.append(len(accuracy) + 1)
            accuracy.append(m['eval_accuracy'])
            precision.append(m['eval_precision'])
            recall.append(m['eval_recall'])
            f1.append(m['eval_f1'])
    return epochs, accuracy, precision, recall, f1

# Plot metrics
def save_metrics_chart(model_name, epochs, accuracy, precision, recall, f1):
    chart_config = {
        "type": "line",
        "data": {
            "labels": epochs,
            "datasets": [
                {"label": "Accuracy", "data": accuracy, "borderColor": "#FF6384", "fill": False},
                {"label": "Precision", "data": precision, "borderColor": "#36A2EB", "fill": False},
                {"label": "Recall", "data": recall, "borderColor": "#FFCE56", "fill": False},
                {"label": "F1", "data": f1, "borderColor": "#4BC0C0", "fill": False}
            ]
        },
        "options": {
            "scales": {
                "y": {"title": {"display": True, "text": "Score"}, "min": 0, "max": 1},
                "x": {"title": {"display": True, "text": "Epoch"}}
            },
            "plugins": {"title": {"display": True, "text": f"{model_name} Training Metrics"}}
        }
    }
    output_path = f'D:/mental_health/graphs/{model_name.lower()}_metrics.json'
    with open(output_path, 'w') as f:
        json.dump(chart_config, f)
    print(f"{model_name} metrics chart saved to {output_path}")

# Process roBERTa metrics
roberta_metrics = load_metrics('D:/mental_health/roberta_metrics.json')
epochs, accuracy, precision, recall, f1 = extract_metrics(roberta_metrics)
save_metrics_chart('roBERTa', epochs, accuracy, precision, recall, f1)

# Process MentalBERT metrics
mentalbert_metrics = load_metrics('D:/mental_health/mentalbert_metrics.json')
epochs, accuracy, precision, recall, f1 = extract_metrics(mentalbert_metrics)
save_metrics_chart('MentalBERT', epochs, accuracy, precision, recall, f1)