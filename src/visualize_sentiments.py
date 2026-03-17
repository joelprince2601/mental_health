import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load analyzed data
input_csv = 'Reddit-Data-Extractor/Reddit-Data-Extractor/data/analyzed_user_comments.csv'
df = pd.read_csv(input_csv)

# Plot sentiment distribution
sentiment_counts = df['sentiment'].value_counts()
plt.figure(figsize=(8, 6))
sns.barplot(x=sentiment_counts.index, y=sentiment_counts.values, palette='viridis')
plt.title('Sentiment Distribution')
plt.xlabel('Sentiment')
plt.ylabel('Count')
plt.savefig('graphs/sentiment_distribution.png')
plt.show()

# Pie chart for sentiments
plt.figure(figsize=(8, 6))
plt.pie(sentiment_counts.values, labels=sentiment_counts.index, autopct='%1.1f%%', colors=sns.color_palette('viridis'))
plt.title('Sentiment Distribution Pie Chart')
plt.savefig('graphs/sentiment_pie.png')
plt.show()