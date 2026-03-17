# Mental Health Reddit Analysis – End-to-End Pipeline

This repository provides a complete, reproducible pipeline to extract Reddit discussions relevant to mental health, process them with transformer models, analyze progression over time, and generate visualizations and reports.

The codebase ties together:
- Data extraction from Reddit (threads or a single user’s comments)
- Text preprocessing (normalization, de-noising, lemmatization)
- Transformer-based inference for sentiment and mental-health-related categories
- Analysis and visualization (time series trends, distributions, word clouds)
- Optional progression analysis and PDF report generation

## Repository Structure

```
mental_health/
├── config/                                # (optional) additional config
├── data/                                  # your local data (raw/derived)
├── graphs/                                # generated plots
├── models/                                # local transformer weights/tokenizers
├── output/                                # misc outputs
├── reports/                               # generated PDF reports
├── summaries/                             # CSV summaries
├── src/
│   ├── pipeline_orchestrator.py           # end-to-end driver
│   ├── process_reddit_data.py             # sentiment & category inference
│   ├── preprocessing.py                   # text cleaning utilities
│   └── progression_analysis.py            # advanced progression analytics (script-style)
├── Reddit-Data-Extractor/                 # bundled extractor project
│   └── Reddit-Data-Extractor/
│       ├── config.py                      # provide Reddit API credentials
│       └── data/                          # raw/processed CSVs written here
├── EXAMPLE_USAGE.md
├── README_PIPELINE.md
└── requirements.txt
```

## Quick Start

1) Install Python 3.10+ and create a virtual environment (recommended)

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

2) Configure Reddit API credentials in `Reddit-Data-Extractor/Reddit-Data-Extractor/config.py`:

```python
REDDIT_CONFIG = {
    'client_id': 'YOUR_CLIENT_ID',
    'client_secret': 'YOUR_CLIENT_SECRET',
    'user_agent': 'YourApp/1.0 by YourUsername'
}
```

3) Run the pipeline interactively:

```bash
cd src
python pipeline_orchestrator.py
```

You can also call `run_pipeline(...)` programmatically (see Examples below and `EXAMPLE_USAGE.md`).

## Step-by-Step Pipeline Flow

The pipeline orchestrates three core stages:

1. Data Extraction (Reddit)
   - Source: `Reddit-Data-Extractor/Reddit-Data-Extractor` (imported as a local module).
   - You can:
     - Extract full conversation threads from selected subreddits.
     - Extract all comments from a specific user within a given thread.
     - Use an existing CSV file you already have.
   - Output: CSV saved under `Reddit-Data-Extractor/Reddit-Data-Extractor/data/` with a timestamped filename.

2. Data Processing (Transformers)
   - File: `src/process_reddit_data.py`
   - For each comment:
     - Preprocess text using `src/preprocessing.py` (contractions, lowercasing, URL/HTML/user/number normalization, stopword removal, punctuation removal, lemmatization).
     - Run a fine-tuned RoBERTa model for sentiment: Negative / Neutral / Positive.
     - If sentiment is Negative, run a fine-tuned MentalBERT (BERT-based) classifier to assign a category (e.g., Depression, Anxiety, Stress, etc.).
   - Output: A processed CSV with columns like `thread_id`, `thread_title`, `position`, `author`, `text`, `cleaned_text`, `sentiment`, `category`, `timestamp` written under `.../data/processed_data/`.

3. Visualization and Reporting
   - File: `src/pipeline_orchestrator.py`
   - Generates plots in `graphs/`:
     - Sentiment distribution (bar + pie)
     - Category distribution for negative comments (bar + pie)
     - Sentiment trends over time
     - Top users’ sentiment distribution
     - Category vs. sentiment heatmap
     - Comment length distribution per sentiment
     - Sentiment by position in thread
     - Optional word cloud (requires `wordcloud` package)
   - Output artifacts are summarized at the end of the run in the console and returned as a Python dict.

Optional 4. Progression Analysis
- File: `src/progression_analysis.py` (script-style, run directly)
- Performs deeper time-series and per-user progression analytics, including:
  - Per-user linear regression of sentiment over time (slope, R², p-value; Improving / Deteriorating / Stable).
  - Nuanced dynamics: betterment vs. deterioration transitions, phase deltas, Mann–Kendall tau, volatility, stationarity tests (ADF).
  - Plots per-user progressions for top active users and overall distributions.
  - Generates a detailed PDF report under `reports/` with tables and selected plots.

## How the Core Modules Work

### `src/pipeline_orchestrator.py`

Responsibilities:
- Entry point that wires together extraction → processing → visualization.
- Imports the Reddit extractor dynamically from the bundled extractor project.
- Offers both interactive prompts and programmatic `run_pipeline(extraction_type, params)` usage.

Key flow:
1. Load `REDDIT_CONFIG`.
2. Initialize `RedditExtractor`.
3. Based on `extraction_type`:
   - `full_threads`: call `extract_from_subreddits(subreddits, threads_per_sub, min_comments)` and save CSV.
   - `user_comments`: call `extract_user_comments_from_thread(thread_url, username)` and save CSV.
   - `existing`: use the given `file_path` directly.
   - Interactive: prompt the user for one of the above.
4. Read the chosen CSV with pandas, normalize column names (e.g., map `position_in_thread` → `position` if present).
5. For each comment, call into `process_reddit_data.predict_sentiment` and conditionally `predict_category`.
6. Save a timestamped processed CSV under `.../data/processed_data/`.
7. Produce multiple matplotlib/seaborn charts under `graphs/` using a non-interactive backend (`Agg`).
8. Return a dictionary containing `processed_df`, output path, timestamp, and graphs directory.

Notes:
- Designed to be run headless on servers.
- Uses robust plotting guards (e.g., check column existence) and creates missing directories.

### `src/process_reddit_data.py`

Responsibilities:
- Load fine-tuned transformer models and perform inference.

Implementation details:
- Loads RoBERTa sentiment model from `models/roberta_finetuned_model` with `RobertaTokenizer` and `RobertaForSequenceClassification`.
- Loads MentalBERT category model from `models/mentalbert_finetuned_model` with `AutoTokenizer` and `AutoModelForSequenceClassification`.
- Moves models to CUDA if available; otherwise uses CPU.
- `predict_sentiment(text)`:
  - Calls `preprocessing.clean_text(text)`.
  - Tokenizes with RoBERTa tokenizer (max_length=128, padding/truncation).
  - Performs forward pass, applies softmax, maps argmax to {Negative, Neutral, Positive}.
  - Returns `(label, cleaned_text)`.
- `predict_category(text)`:
  - Similar pipeline with MentalBERT tokenizer/model.
  - Maps argmax to a 10-class label set (e.g., Depression, Anxiety, Stress, PTSD, Social Issues, Self-harm, Support Seeking, Support Providing, Professional Treatment, Off-topic).

Model assets:
- Ensure the directories `models/roberta_finetuned_model` and `models/mentalbert_finetuned_model` exist and contain compatible `config.json`, tokenizer files, and `model.safetensors`.

### `src/preprocessing.py`

Responsibilities:
- Clean and normalize raw Reddit text to make it model-friendly.

Pipeline steps (in order):
1. Fix contractions (e.g., "don't" → "do not").
2. Lowercase.
3. Replace URLs with `URL`.
4. Strip HTML.
5. Replace `@mentions` with `user`.
6. Normalize numbers to `NUMBER`.
7. Replace `<3` with `HEART`.
8. Remove alphanumeric tokens containing digits.
9. Remove English stopwords (retains a few pronouns like `i`, `me`, `my`, `myself`, `dont`).
10. Remove punctuation.
11. Lemmatize tokens as verbs.

NLTK assets downloaded at import:
- `stopwords`, `wordnet`.

### `src/progression_analysis.py`

Responsibilities:
- Standalone analysis script for longitudinal user sentiment dynamics.

Core methods:
- `compute_progression(user_df)`: per-user linear regression on `sentiment_num` vs. days since first comment; returns slope, trend label, R², p-value, and total change.
- `sentiment_transition_analysis(user_df)`: computes betterment/deterioration shares, net change, early vs. late phase delta, Mann–Kendall tau, volatility, and ADF p-value.

Outputs:
- Graphs saved under `graphs/` (overall and per top users).
- A PDF report saved under `reports/` with tabular summaries and embedded plots.
- A CSV summary saved under `summaries/`.

## Data Lifecycle and Columns

Input CSV (from extractor) commonly includes columns:
- `thread_id`, `thread_title`, `position` (or `position_in_thread`), `author`, `text`, `timestamp`.

Processed CSV includes additional columns:
- `cleaned_text`: normalized comment text
- `sentiment`: Negative | Neutral | Positive
- `category`: mental-health category (only for Negative; otherwise `N/A`)

Directory conventions:
- Raw/initial CSVs: `Reddit-Data-Extractor/Reddit-Data-Extractor/data/`
- Processed CSVs: `.../data/processed_data/`
- Plots: `graphs/`
- Reports: `reports/`
- Summaries: `summaries/`

## Usage Examples

Programmatic (Python):

```python
from src.pipeline_orchestrator import run_pipeline

result = run_pipeline(
    extraction_type='full_threads',
    params={
        'subreddits': ['depression', 'anxiety'],
        'threads_per_sub': 5,
        'min_comments': 10
    }
)

if result:
    print(len(result['processed_df']))
    print(result['output_csv'])
    print(result['graphs_dir'])
```

Interactive (CLI):

```bash
cd src
python pipeline_orchestrator.py
```

Existing file:

```python
from src.pipeline_orchestrator import run_pipeline
run_pipeline(
    extraction_type='existing',
    params={'file_path': 'Reddit-Data-Extractor/Reddit-Data-Extractor/data/your_file.csv'}
)
```

Progression analysis (optional deep-dive):

```bash
python src/progression_analysis.py
```

## Dependencies

Install via `requirements.txt`:
- pandas, numpy, matplotlib, seaborn
- torch, transformers
- nltk, contractions
- scipy, statsmodels, scikit-learn
- pymannkendall, reportlab, wordcloud (optional for word cloud)
- praw (used by the extractor project)

GPU acceleration:
- If CUDA is available, models automatically use it; otherwise they run on CPU.

## Configuration and Environment

- Reddit credentials: `Reddit-Data-Extractor/Reddit-Data-Extractor/config.py` (mandatory for extraction).
- Model assets: Ensure `models/roberta_finetuned_model` and `models/mentalbert_finetuned_model` exist with valid weights/tokenizers.
- Matplotlib backend: set to `Agg` in the orchestrator for headless plotting.

## Outputs and Deliverables

After a successful run you should have:
- A processed CSV with sentiment and category labels.
- Multiple plots under `graphs/` describing distributions and trends.
- (Optional) A PDF report under `reports/` and a CSV summary under `summaries/` when running `progression_analysis.py`.

## Common Issues and Tips

- Missing models: Place your fine-tuned models under `models/` with Hugging Face-compatible structure.
- Column mismatches: The orchestrator maps `position_in_thread` to `position` if needed.
- Word cloud optional: Install `wordcloud` or the step will be skipped.
- Long runtimes: Use a GPU; reduce `threads_per_sub` or the number of subreddits.

## Safety and Ethics

This project is for research and educational purposes only. Outputs are not medical diagnoses. Handle user-generated content responsibly and comply with Reddit’s API Terms and community privacy expectations.


