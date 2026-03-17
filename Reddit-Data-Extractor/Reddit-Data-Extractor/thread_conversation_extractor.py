import praw
import pandas as pd
import json
import time
from datetime import datetime
import os

class RedditExtractor:
    def __init__(self, reddit_config):
        """Initializes the Reddit Extractor with PRAW credentials."""
        self.reddit = praw.Reddit(**reddit_config)
        self.all_subreddits = [
            'depression', 'anxiety', 'mentalhealth', 'bipolar', 
            'BipolarReddit', 'ptsd', 'socialanxiety', 'OCD'
        ]

    def extract_thread_with_comments(self, submission):
        """Extracts a single, complete thread with chronologically sorted comments."""
        submission.comments.replace_more(limit=None)
        all_comments = submission.comments.list()
        all_comments.sort(key=lambda x: x.created_utc)
        
        thread_data = []
        # Add original post
        thread_data.append({
            'thread_id': submission.id, 'subreddit': submission.subreddit.display_name, 'thread_title': submission.title,
            'position': 0, 'author': str(submission.author) if submission.author else '[deleted]', 'text': submission.selftext,
            'timestamp': datetime.fromtimestamp(submission.created_utc).isoformat()
        })
        # Add comments
        for i, comment in enumerate(all_comments):
            if hasattr(comment, 'body'):
                thread_data.append({
                    'thread_id': submission.id, 'subreddit': submission.subreddit.display_name, 'thread_title': submission.title,
                    'position': i + 1, 'author': str(comment.author) if comment.author else '[deleted]', 'text': comment.body,
                    'timestamp': datetime.fromtimestamp(comment.created_utc).isoformat()
                })
        return thread_data

    def extract_from_subreddits(self, subreddits_to_scan, threads_per_sub, min_comments):
        """Extracts full threads from a list of subreddits."""
        all_extracted_data = []
        print("\n🚀 Starting Full Conversation Extraction...")
        for sub_name in subreddits_to_scan:
            print(f"🔍 Searching r/{sub_name}...")
            subreddit = self.reddit.subreddit(sub_name)
            threads_found = 0
            for submission in subreddit.hot(limit=100):
                if threads_found >= threads_per_sub:
                    break
                if submission.num_comments >= min_comments and not submission.stickied:
                    print(f"  -> Extracting thread: '{submission.title[:50]}...'")
                    all_extracted_data.extend(self.extract_thread_with_comments(submission))
                    threads_found += 1
                    time.sleep(1)
        return pd.DataFrame(all_extracted_data)

    def extract_user_comments_from_thread(self, thread_url, username):
        """Extracts all comments by a single user from a specific thread."""
        print(f"\n🚀 Extracting comments by u/{username} from the specified thread...")
        try:
            submission = self.reddit.submission(url=thread_url)
            submission.comments.replace_more(limit=None)
            all_comments = submission.comments.list()
            
            user_comments = []
            for i, comment in enumerate(all_comments):
                if hasattr(comment, 'author') and comment.author and comment.author.name.lower() == username.lower():
                    user_comments.append({
                        'thread_id': submission.id, 'thread_title': submission.title, 'position_in_thread': i + 1,
                        'author': comment.author.name, 'text': comment.body,
                        'timestamp': datetime.fromtimestamp(comment.created_utc).isoformat()
                    })
            
            print(f"✅ Found {len(user_comments)} comments by u/{username}.")
            return pd.DataFrame(user_comments)
        except Exception as e:
            print(f"❌ Error fetching thread. Please check the URL. Details: {e}")
            return pd.DataFrame()

def save_data(df, base_filename):
    """Saves a DataFrame to a CSV file in the 'data' folder."""
    if df.empty:
        print("No data was extracted to save.")
        return
    
    output_dir = "data"
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(output_dir, f"{base_filename}_{timestamp}.csv")
    df.to_csv(filename, index=False)
    print(f"\n🎉 Success! Data saved to: {filename}")

def main():
    """Main menu-driven function for the Reddit Data Extractor."""
    try:
        from config import REDDIT_CONFIG
    except ImportError:
        print("❌ Error: 'config.py' not found. Please ensure it exists with your API credentials.")
        return

    extractor = RedditExtractor(REDDIT_CONFIG)

    while True:
        print("\n--- Reddit Data Extractor Menu ---")
        print("1. Extract Full Conversation Threads")
        print("2. Extract Single User Comments from a Thread")
        print("3. Exit")
        choice = input("Enter your choice (1-3): ").strip()

        if choice == '1':
            try:
                print("\nAvailable Subreddits:")
                for i, sub in enumerate(extractor.all_subreddits):
                    print(f"  {i+1}. {sub}")
                
                sub_indices_str = input("Enter the numbers of the subreddits to scan (e.g., 1, 3, 5): ")
                sub_indices = [int(i.strip()) - 1 for i in sub_indices_str.split(',')]
                subreddits_to_scan = [extractor.all_subreddits[i] for i in sub_indices]

                threads_per_sub = int(input("How many threads to extract per subreddit? "))
                min_comments = int(input("What is the minimum number of comments a thread must have? "))
                
                df_threads = extractor.extract_from_subreddits(subreddits_to_scan, threads_per_sub, min_comments)
                save_data(df_threads, "full_conversation_threads")
            except (ValueError, IndexError):
                print("❌ Invalid input. Please enter numbers correctly.")

        elif choice == '2':
            try:
                thread_url = input("Enter the full URL of the Reddit thread: ")
                username = input("Enter the username to extract comments for: ")
                
                df_user = extractor.extract_user_comments_from_thread(thread_url, username)
                save_data(df_user, f"user_{username}_comments")
            except Exception as e:
                print(f"An error occurred: {e}")

        elif choice == '3':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please select 1, 2, or 3.")

if __name__ == "__main__":
    main()