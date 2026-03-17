# config.py
# Reddit API Configuration for Mental Health Analysis Project

REDDIT_CONFIG = {
    'client_id': 'POdYZNo__sg9aocb_FqpGg',        # The short string under your app name
    'client_secret': 'F-YB3_7JFiziWui02h4UWwj1mL4jVw', # The long secret string  
    'user_agent': 'MentalHealthAnalyzer/1.0 by shainaoffici1'
}


# Model Configuration
MODEL_CONFIG = {
    'primary_model': 'cardiffnlp/twitter-roberta-base-sentiment-latest',
    'fallback_enabled': True,
    'cache_models': True
}

# Export Settings
EXPORT_CONFIG = {
    'save_json': True,
    'save_csv': True, 
    'include_metadata': True,
    'timestamp_files': True
}

# Project Settings
PROJECT_SETTINGS = {
    'max_posts_per_subreddit': 50,  # How many posts to collect per subreddit
    'sample_threads': 25,           # Number of sample threads to generate
    'posts_per_thread': 15,         # Posts per sample thread
    'target_subreddits': [
        'depression', 
        'anxiety', 
        'mentalhealth', 
        'bipolar',
        'BipolarReddit', 
        'ptsd', 
        'socialanxiety', 
        'OCD'
    ]
}

# File Output Settings
OUTPUT_SETTINGS = {
    'save_plots': True,
    'plot_filename': 'mental_health_analysis_results.png',
    'data_export': True,
    'export_filename': 'processed_mental_health_data.csv'
}