import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load analyzed data
input_csv = 'Reddit-Data-Extractor/Reddit-Data-Extractor/data/analyzed_user_comments.csv'
df = pd.read_csv(input_csv)

# Filter negative comments
negative_df = df[df['sentiment'] == 'Negative']

# Plot category distribution
category_counts = negative_df['category'].value_counts()
plt.figure(figsize=(10, 6))
sns.barplot(x=category_counts.values, y=category_counts.index, palette='viridis')
plt.title('Category Distribution for Negative Comments')
plt.xlabel('Count')
plt.ylabel('Category')
plt.savefig('graphs/category_distribution.png')
plt.show()

# Pie chart for categories
plt.figure(figsize=(10, 8))
plt.pie(category_counts.values, labels=category_counts.index, autopct='%1.1f%%', colors=sns.color_palette('viridis'))
plt.title('Category Distribution Pie Chart')
plt.savefig('graphs/category_pie.png')
plt.show()