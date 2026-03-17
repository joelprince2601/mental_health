import os
import sys
from datetime import datetime

# Setup paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

# Add paths for imports
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(parent_dir, 'Reddit-Data-Extractor', 'Reddit-Data-Extractor'))

def run_pipeline(extraction_type=None, params=None):
    """Main pipeline orchestrator that executes existing scripts in sequence.
    
    Args:
        extraction_type: 'full_threads', 'user_comments', 'existing', or None for interactive
        params: Dictionary with parameters for extraction
    """
    print("=" * 60)
    print("🚀 Mental Health Data Analysis Pipeline")
    print("=" * 60)
    
    # Import Reddit config
    import importlib.util
    config_path = os.path.join(parent_dir, 'Reddit-Data-Extractor', 'Reddit-Data-Extractor', 'config.py')
    spec = importlib.util.spec_from_file_location("config", config_path)
    config_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(config_module)
    REDDIT_CONFIG = config_module.REDDIT_CONFIG
    
    # Import extractor
    from thread_conversation_extractor import RedditExtractor
    
    # Initialize extractor
    extractor = RedditExtractor(REDDIT_CONFIG)
    
    # Data extraction
    input_csv = None
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    data_dir = os.path.join(parent_dir, 'Reddit-Data-Extractor', 'Reddit-Data-Extractor', 'data')
    
    if extraction_type == 'full_threads' and params:
        # Extract full conversation threads with provided params
        subreddits_to_scan = params.get('subreddits', [])
        threads_per_sub = params.get('threads_per_sub', 5)
        min_comments = params.get('min_comments', 10)
        
        print(f"\n🔍 Extracting from subreddits: {subreddits_to_scan}")
        df_threads = extractor.extract_from_subreddits(subreddits_to_scan, threads_per_sub, min_comments)
        
        os.makedirs(data_dir, exist_ok=True)
        input_csv = os.path.join(data_dir, f"extracted_data_{timestamp}.csv")
        df_threads.to_csv(input_csv, index=False)
        print(f"💾 Extracted data saved to {input_csv}")
    
    elif extraction_type == 'user_comments' and params:
        # Extract single user comments
        thread_url = params.get('thread_url')
        username = params.get('username')
        
        print(f"\n🔍 Extracting comments by {username}")
        df_user = extractor.extract_user_comments_from_thread(thread_url, username)
        
        if len(df_user) > 0:
            os.makedirs(data_dir, exist_ok=True)
            input_csv = os.path.join(data_dir, f"user_comments_{timestamp}.csv")
            df_user.to_csv(input_csv, index=False)
            print(f"💾 Extracted data saved to {input_csv}")
        else:
            print("❌ No data extracted. Exiting.")
            return None
    
    elif extraction_type == 'existing' and params:
        # Use existing file
        existing_file = params.get('file_path')
        if os.path.exists(existing_file):
            input_csv = existing_file
            print(f"✅ Using existing file: {input_csv}")
        else:
            print(f"❌ File not found: {existing_file}")
            return None
    
    else:
        # Interactive mode
        print("\n--- Data Extraction Options ---")
        print("1. Extract Full Conversation Threads")
        print("2. Extract Single User Comments from a Thread")
        print("3. Use Existing Data (Skip Extraction)")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            print("\nAvailable Subreddits:")
            for i, sub in enumerate(extractor.all_subreddits):
                print(f"  {i+1}. {sub}")
            
            sub_indices_str = input("Enter the numbers of the subreddits to scan (e.g., 1, 3, 5): ")
            sub_indices = [int(i.strip()) - 1 for i in sub_indices_str.split(',')]
            subreddits_to_scan = [extractor.all_subreddits[i] for i in sub_indices]
            
            threads_per_sub = int(input("How many threads to extract per subreddit? "))
            min_comments = int(input("What is the minimum number of comments a thread must have? "))
            
            df_threads = extractor.extract_from_subreddits(subreddits_to_scan, threads_per_sub, min_comments)
            
            os.makedirs(data_dir, exist_ok=True)
            input_csv = os.path.join(data_dir, f"extracted_data_{timestamp}.csv")
            df_threads.to_csv(input_csv, index=False)
            print(f"\n💾 Extracted data saved to {input_csv}")
        
        elif choice == '2':
            thread_url = input("Enter the full URL of the Reddit thread: ")
            username = input("Enter the username to extract comments for: ")
            
            df_user = extractor.extract_user_comments_from_thread(thread_url, username)
            
            if len(df_user) > 0:
                os.makedirs(data_dir, exist_ok=True)
                input_csv = os.path.join(data_dir, f"user_comments_{timestamp}.csv")
                df_user.to_csv(input_csv, index=False)
                print(f"\n💾 Extracted data saved to {input_csv}")
            else:
                print("❌ No data extracted. Exiting.")
                return None
        
        elif choice == '3':
            if not os.path.exists(data_dir):
                print(f"❌ Data directory not found: {data_dir}")
                return None
            
            csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
            if not csv_files:
                print(f"❌ No CSV files found in {data_dir}")
                return None
            
            print("\nAvailable data files:")
            for i, file in enumerate(csv_files):
                print(f"  {i+1}. {file}")
            
            file_index = int(input("\nEnter the number of the file to use: ")) - 1
            input_csv = os.path.join(data_dir, csv_files[file_index])
            print(f"✅ Using existing file: {input_csv}")
        
        else:
            print("❌ Invalid choice. Exiting.")
            return None
    
    if not input_csv or not os.path.exists(input_csv):
        print("❌ No valid input file. Exiting.")
        return None
    
    # Step 2: Process data using process_reddit_data.py
    print("\n" + "=" * 60)
    print("📊 Step 2: Processing Data with Transformers")
    print("=" * 60)
    
    # Import required modules
    import pandas as pd
    import process_reddit_data as prd
    
    # Read the data
    df = pd.read_csv(input_csv)
    
    # Handle column name mismatch - some CSV files have 'position_in_thread' instead of 'position'
    if 'position_in_thread' in df.columns:
        df['position'] = df['position_in_thread']
    
    # Process using the functions from process_reddit_data
    results = []
    for index, row in df.iterrows():
        if index % 10 == 0:
            print(f"   Processing row {index}/{len(df)}...", end='\r')
        
        text = row['text']
        sentiment, cleaned_text = prd.predict_sentiment(text)
        category = prd.predict_category(text) if sentiment == 'Negative' else 'N/A'
        
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
    
    print(f"\n✅ Processing complete. Processed {len(results)} comments.")
    
    # Save results with timestamp
    results_df = pd.DataFrame(results)
    
    # Save to processed_data folder with timestamp
    processed_dir = os.path.join(data_dir, 'processed_data')
    os.makedirs(processed_dir, exist_ok=True)
    
    # Extract base filename and add timestamp
    base_filename = os.path.basename(input_csv).replace('.csv', '')
    output_csv = os.path.join(processed_dir, f'{base_filename}_processed_{timestamp}.csv')
    
    results_df.to_csv(output_csv, index=False)
    print(f"💾 Results saved to {output_csv}")
    
    # Step 3: Create visualizations
    print("\n" + "=" * 60)
    print("📈 Step 3: Generating Visualizations")
    print("=" * 60)
    
    # Create graphs directory
    graphs_dir = os.path.join(parent_dir, 'graphs')
    os.makedirs(graphs_dir, exist_ok=True)
    
    # Generate sentiment visualizations
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns
    
    print("   Generating sentiment visualizations...")
    sentiment_counts = results_df['sentiment'].value_counts()
    
    plt.figure(figsize=(8, 6))
    sns.barplot(x=sentiment_counts.index, y=sentiment_counts.values, palette='viridis')
    plt.title('Sentiment Distribution')
    plt.xlabel('Sentiment')
    plt.ylabel('Count')
    plt.savefig(os.path.join(graphs_dir, 'sentiment_distribution.png'))
    plt.close()
    
    plt.figure(figsize=(8, 6))
    plt.pie(sentiment_counts.values, labels=sentiment_counts.index, autopct='%1.1f%%', colors=sns.color_palette('viridis'))
    plt.title('Sentiment Distribution Pie Chart')
    plt.savefig(os.path.join(graphs_dir, 'sentiment_pie.png'))
    plt.close()
    
    # Generate category visualizations
    print("   Generating category visualizations...")
    negative_df = results_df[results_df['sentiment'] == 'Negative']
    
    if len(negative_df) > 0:
        category_counts = negative_df['category'].value_counts()
        
        plt.figure(figsize=(10, 6))
        sns.barplot(x=category_counts.values, y=category_counts.index, palette='viridis')
        plt.title('Category Distribution for Negative Comments')
        plt.xlabel('Count')
        plt.ylabel('Category')
        plt.savefig(os.path.join(graphs_dir, 'category_distribution.png'))
        plt.close()
        
        plt.figure(figsize=(10, 8))
        plt.pie(category_counts.values, labels=category_counts.index, autopct='%1.1f%%', colors=sns.color_palette('viridis'))
        plt.title('Category Distribution Pie Chart')
        plt.savefig(os.path.join(graphs_dir, 'category_pie.png'))
        plt.close()
    
    # Additional Graph 1: Sentiment over Time
    print("   Generating time series analysis...")
    results_df['timestamp'] = pd.to_datetime(results_df['timestamp'])
    results_df['date'] = results_df['timestamp'].dt.date
    daily_sentiment = results_df.groupby(['date', 'sentiment']).size().unstack(fill_value=0)
    
    plt.figure(figsize=(14, 6))
    if 'Positive' in daily_sentiment.columns:
        plt.plot(daily_sentiment.index, daily_sentiment['Positive'], marker='o', label='Positive', color='green', linewidth=2)
    if 'Neutral' in daily_sentiment.columns:
        plt.plot(daily_sentiment.index, daily_sentiment['Neutral'], marker='s', label='Neutral', color='orange', linewidth=2)
    if 'Negative' in daily_sentiment.columns:
        plt.plot(daily_sentiment.index, daily_sentiment['Negative'], marker='^', label='Negative', color='red', linewidth=2)
    plt.title('Sentiment Trends Over Time')
    plt.xlabel('Date')
    plt.ylabel('Number of Comments')
    plt.legend()
    plt.xticks(rotation=45)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, 'sentiment_over_time.png'))
    plt.close()
    
    # Additional Graph 2: Top Active Users Sentiment Distribution
    print("   Generating author activity analysis...")
    top_users = results_df['author'].value_counts().head(10)
    user_sentiments = results_df[results_df['author'].isin(top_users.index)].groupby(['author', 'sentiment']).size().unstack(fill_value=0)
    user_sentiments = user_sentiments.loc[top_users.index]
    
    plt.figure(figsize=(12, 6))
    user_sentiments.plot(kind='bar', stacked=True, color=['red', 'orange', 'green'], figsize=(12, 6))
    plt.title('Top 10 Active Users: Sentiment Distribution')
    plt.xlabel('Author')
    plt.ylabel('Number of Comments')
    plt.xticks(rotation=45, ha='right')
    plt.legend(title='Sentiment')
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, 'top_users_sentiment.png'))
    plt.close()
    
    # Additional Graph 3: Category-Sentiment Heatmap
    print("   Generating category-sentiment heatmap...")
    category_sentiment = pd.crosstab(results_df['category'], results_df['sentiment'], normalize='index') * 100
    
    if not category_sentiment.empty:
        plt.figure(figsize=(10, 6))
        sns.heatmap(category_sentiment, annot=True, fmt='.1f', cmap='RdYlGn', cbar_kws={'label': 'Percentage (%)'})
        plt.title('Category vs Sentiment Heatmap')
        plt.xlabel('Sentiment')
        plt.ylabel('Category')
        plt.tight_layout()
        plt.savefig(os.path.join(graphs_dir, 'category_sentiment_heatmap.png'))
        plt.close()
    
    # Additional Graph 4: Comment Length Distribution by Sentiment
    print("   Generating comment length analysis...")
    results_df['text_length'] = results_df['text'].str.len()
    
    plt.figure(figsize=(10, 6))
    for sentiment in ['Positive', 'Neutral', 'Negative']:
        if sentiment in results_df['sentiment'].values:
            data = results_df[results_df['sentiment'] == sentiment]['text_length']
            plt.hist(data, bins=30, alpha=0.6, label=sentiment, edgecolor='black')
    plt.title('Comment Length Distribution by Sentiment')
    plt.xlabel('Character Count')
    plt.ylabel('Frequency')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, 'comment_length_distribution.png'))
    plt.close()
    
    # Additional Graph 5: Sentiment Distribution by Position in Thread
    print("   Generating thread position analysis...")
    position_sentiment = pd.crosstab(results_df['position'], results_df['sentiment'], normalize='index') * 100
    
    plt.figure(figsize=(12, 6))
    position_sentiment.plot(kind='bar', stacked=True, color=['red', 'orange', 'green'], figsize=(12, 6))
    plt.title('Sentiment Distribution by Position in Thread')
    plt.xlabel('Position in Thread')
    plt.ylabel('Percentage (%)')
    plt.xticks(rotation=0)
    plt.legend(title='Sentiment')
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, 'position_sentiment.png'))
    plt.close()
    
    # Additional Graph 6: Top Keywords Word Cloud (for negative comments)
    try:
        from wordcloud import WordCloud
        print("   Generating word cloud...")
        
        if len(negative_df) > 0:
            # Combine all negative comments
            text = ' '.join(negative_df['text'].astype(str))
            
            # Generate word cloud
            wordcloud = WordCloud(width=800, height=400, background_color='white', max_words=100).generate(text)
            
            plt.figure(figsize=(12, 6))
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            plt.title('Most Frequent Words in Negative Comments')
            plt.tight_layout()
            plt.savefig(os.path.join(graphs_dir, 'wordcloud_negative.png'))
            plt.close()
    except ImportError:
        print("   Skipping word cloud (wordcloud package not installed)")
    
    print("✅ All visualizations created successfully!")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Pipeline Complete!")
    print("=" * 60)
    print(f"📊 Total Comments Analyzed: {len(results_df)}")
    print(f"😊 Positive: {(results_df['sentiment'] == 'Positive').sum()}")
    print(f"😐 Neutral: {(results_df['sentiment'] == 'Neutral').sum()}")
    print(f"😢 Negative: {(results_df['sentiment'] == 'Negative').sum()}")
    print(f"\n📁 Processed Data: {output_csv}")
    print(f"📁 Visualizations: {graphs_dir}")
    
    return {
        'processed_df': results_df,
        'output_csv': output_csv,
        'timestamp': timestamp,
        'graphs_dir': graphs_dir
    }

if __name__ == "__main__":
    result = run_pipeline()
