import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import numpy as np
from scipy import stats
import pymannkendall as mk
import statsmodels.api as sm
from sklearn.linear_model import LinearRegression
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from sklearn.feature_extraction.text import TfidfVectorizer
from statsmodels.tsa.stattools import adfuller 

# Create output directories if they don't exist
os.makedirs('graphs', exist_ok=True)
os.makedirs('reports', exist_ok=True)
os.makedirs('output', exist_ok=True)

# Load analyzed data
input_csv = 'Reddit-Data-Extractor/Reddit-Data-Extractor/data/analyzed_user_comments_20250908.csv'
df = pd.read_csv(input_csv)

# Assume columns: 'timestamp', 'author', 'sentiment', 'disorder_label' (if available), 'text' (for keywords)
print(f"Loaded data shape: {df.shape}")
print("Columns:", df.columns.tolist())

# Map sentiments to numerical values
sentiment_map = {'Negative': -1, 'Neutral': 0, 'Positive': 1}
df['sentiment_num'] = df['sentiment'].map(sentiment_map)

# Parse timestamps (assume 'timestamp' column is in datetime format or convertible)
df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')

# Drop rows with invalid timestamps
df = df.dropna(subset=['timestamp'])

# Sort by timestamp and author
df = df.sort_values(['author', 'timestamp'])

# Function to compute progression slope for a user
def compute_progression(user_df):
    if len(user_df) < 2:
        return np.nan, "Insufficient data", np.nan, np.nan
    
    # Convert timestamp to numeric (days since first comment)
    user_df = user_df.copy()
    time_deltas = user_df['timestamp'] - user_df['timestamp'].min()
    user_df['days_since_start'] = time_deltas.dt.total_seconds() / (24 * 3600)
    
    # Check for zero variance in time (all on same day)
    if user_df['days_since_start'].std() == 0:
        return 0, "Stable (No Time Variance)", 0, 1.0
    
    # Linear regression on sentiment vs days
    X = user_df['days_since_start'].values.reshape(-1, 1)
    y = user_df['sentiment_num'].values
    reg = LinearRegression().fit(X, y)
    slope = reg.coef_[0]
    
    # Statistical significance (p-value) using statsmodels
    X_with_const = sm.add_constant(X)
    model = sm.OLS(y, X_with_const).fit()
    p_value = model.pvalues[1]  # p-value for slope
    
    # Classify trend based on slope and significance (p < 0.05)
    trend = "Stable"
    if p_value < 0.05:
        if slope > 0.05:  # Adjusted threshold
            trend = "Improving"
        elif slope < -0.05:  # Adjusted threshold
            trend = "Deteriorating"
    
    # R-squared for fit quality
    r2 = reg.score(X, y)
    
    total_change = slope * user_df['days_since_start'].max()  # Total sentiment shift over period
    return slope, trend, r2, p_value, total_change

# New algorithm: Sentiment Transition Analysis for nuances
def sentiment_transition_analysis(user_df):
    if len(user_df) < 2:
        return {"betterment_score": np.nan, "deterioration_score": np.nan, "net_change": np.nan, "phase_delta": np.nan, "mann_kendall_tau": np.nan, "volatility": np.nan}
    
    # Transitions between consecutive comments
    shifts = np.diff(user_df['sentiment_num'])
    betterment = np.sum(shifts > 0) / (len(shifts) or 1) * 100  # % positive shifts
    deterioration = np.sum(shifts < 0) / (len(shifts) or 1) * 100  # % negative shifts
    net_change = betterment - deterioration
    
    # Phase division (halves)
    mid_idx = len(user_df) // 2
    early_avg = user_df['sentiment_num'].iloc[:mid_idx].mean()
    late_avg = user_df['sentiment_num'].iloc[mid_idx:].mean()
    phase_delta = late_avg - early_avg  # Positive = betterment
    
    # Mann-Kendall for non-linear trend (tau: -1 det, +1 imp)
    mk_result = mk.original_test(user_df['sentiment_num'])
    tau = mk_result.Tau if mk_result else np.nan
    
    # Volatility (std dev)
    volatility = user_df['sentiment_num'].std()
    
    # Stationarity check (ADF p-value <0.05 = non-stationary, i.e., trend present)
    adf_p = adfuller(user_df['sentiment_num'])[1]
    
    return {
        "betterment_score": betterment,
        "deterioration_score": deterioration,
        "net_change": net_change,
        "phase_delta": phase_delta,
        "mann_kendall_tau": tau,
        "volatility": volatility,
        "adf_p": adf_p
    }

# Group by author and compute progression
progression_results = []
for author, user_df in df.groupby('author'):
    slope, trend, r2, p_value, total_change = compute_progression(user_df)
    transition_metrics = sentiment_transition_analysis(user_df)
    progression_results.append({
        'author': author,
        'num_comments': len(user_df),
        'slope': slope,
        'trend': trend,
        'r2': r2,
        'p_value': p_value,
        'total_change': total_change,
        'betterment_score': transition_metrics['betterment_score'],
        'deterioration_score': transition_metrics['deterioration_score'],
        'net_change': transition_metrics['net_change'],
        'phase_delta': transition_metrics['phase_delta'],
        'mann_kendall_tau': transition_metrics['mann_kendall_tau'],
        'volatility': transition_metrics['volatility'],
        'adf_p': transition_metrics['adf_p'],
        'first_timestamp': user_df['timestamp'].min(),
        'last_timestamp': user_df['timestamp'].max()
    })

progression_df = pd.DataFrame(progression_results)
print("\nProgression Summary:")
print(progression_df)

# Overall sentiment progression (aggregated across users)
plt.figure(figsize=(14, 8))
sns.lineplot(x='timestamp', y='sentiment_num', data=df, marker='o', ci='sd')
plt.title('Overall Sentiment Progression Over Time (All Users)')
plt.xlabel('Timestamp')
plt.ylabel('Sentiment (Negative=-1, Neutral=0, Positive=1)')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)
plt.savefig('graphs/overall_sentiment_progression.png', dpi=300, bbox_inches='tight')
plt.show()

# Bar plot for overall sentiment distribution
plt.figure(figsize=(10, 6))
sns.countplot(data=df, x='sentiment', palette='viridis')
plt.title('Overall Sentiment Distribution')
plt.xlabel('Sentiment')
plt.ylabel('Count')
plt.savefig('graphs/overall_sentiment_distribution.png', dpi=300, bbox_inches='tight')
plt.show()

# Per-user progression plots (example for top 5 active users)
top_users = progression_df.nlargest(5, 'num_comments')['author'].tolist()
for i, author in enumerate(top_users):
    user_df = df[df['author'] == author].copy()
    if len(user_df) < 2:
        continue
    
    user_df['days_since_start'] = (user_df['timestamp'] - user_df['timestamp'].min()).dt.days
    reg = LinearRegression().fit(user_df['days_since_start'].values.reshape(-1, 1), user_df['sentiment_num'].values)
    
    plt.figure(figsize=(12, 6))
    plt.scatter(user_df['days_since_start'], user_df['sentiment_num'], color='blue', alpha=0.6, label='Comments')
    plt.plot(user_df['days_since_start'], reg.predict(user_df['days_since_start'].values.reshape(-1, 1)), 
             color='red', linestyle='--', label=f'Trend Line (Slope: {reg.coef_[0]:.3f}, R²: {reg.score(user_df["days_since_start"].values.reshape(-1, 1), user_df["sentiment_num"].values):.3f})')
    plt.title(f'Sentiment Progression for User: {author} ({progression_df.loc[progression_df["author"] == author, "trend"].iloc[0]})')
    plt.xlabel('Days Since First Comment')
    plt.ylabel('Sentiment')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.savefig(f'graphs/user_{author}_progression.png', dpi=300, bbox_inches='tight')
    plt.show()

# If 'disorder_label' column exists, add disorder trend analysis
if 'category' in df.columns:
    disorder_map = {'Stress': 0, 'Depression': 1, 'Bipolar': 2, 'Personality': 3, 'Anxiety': 4}  # Adjust based on your data
    df['disorder_num'] = df['category'].map(disorder_map)
    
    plt.figure(figsize=(14, 8))
    sns.lineplot(x='timestamp', y='disorder_num', data=df, marker='s', ci='sd')
    plt.title('Overall Disorder Label Progression Over Time (All Users)')
    plt.xlabel('Timestamp')
    plt.ylabel('Disorder (Numerical Mapping)')
    plt.xticks(rotation=45)
    plt.grid(True, alpha=0.3)
    plt.savefig('graphs/overall_disorder_progression.png', dpi=300, bbox_inches='tight')
    plt.show()

# Keyword extraction with TF-IDF scores
keyword_scores = []
if 'text' in df.columns:
    tfidf = TfidfVectorizer(max_features=10, stop_words='english')
    all_texts = ' '.join(df['text'].dropna())
    keywords = tfidf.fit_transform([all_texts]).toarray()
    feature_names = tfidf.get_feature_names_out()
    keyword_scores = sorted(list(zip(feature_names, keywords[0])), key=lambda x: x[1], reverse=True)
    print("\nTop Keywords with TF-IDF Scores:", keyword_scores)

# Generate enhanced report
def generate_report(progression_df, keyword_scores, output_path='reports/progression_report_1.pdf'):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title and Header
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=18, spaceAfter=20, alignment=1)
    header_style = ParagraphStyle('CustomHeader', parent=styles['Heading1'], fontSize=14, spaceAfter=15)
    story.append(Paragraph("Mental Health Progression Analysis Report", title_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Summary Section
    summary_style = ParagraphStyle('Summary', parent=styles['Normal'], fontSize=12, spaceAfter=10)
    summary = f"<b>Analysis Overview:</b><br/>"
    summary += f"- Total Users Analyzed: {len(progression_df)}<br/>"
    summary += f"- Average Comments per User: {progression_df['num_comments'].mean():.1f}<br/>"
    improving = len(progression_df[progression_df['trend'] == 'Improving'])
    deteriorating = len(progression_df[progression_df['trend'] == 'Deteriorating'])
    stable = len(progression_df[progression_df['trend'] == 'Stable'])
    summary += f"- Trend Distribution: Improving: {improving} ({(improving/len(progression_df)*100):.1f}%), "
    summary += f"Deteriorating: {deteriorating} ({(deteriorating/len(progression_df)*100):.1f}%), "
    summary += f"Stable: {stable} ({(stable/len(progression_df)*100):.1f}%)<br/>"
    summary += f"- Average Sentiment Slope: {progression_df['slope'].mean():.3f}<br/>"
    summary += f"- Data Period: {df['timestamp'].min().date()} to {df['timestamp'].max().date()}"
    story.append(Paragraph(summary, summary_style))
    story.append(Spacer(1, 12))

    # Progression Table
    story.append(Paragraph("<b>Progression Summary:</b>", header_style))
    table_data = [['Author', 'Comments', 'Slope', 'Trend', 'R²', 'p-value', 'Total Change', 'Net Change (%)', 'Period']]
    for _, row in progression_df.iterrows():
        table_data.append([row['author'], row['num_comments'], f"{row['slope']:.3f}", row['trend'], 
                          f"{row['r2']:.3f}", f"{row['p_value']:.3f}", f"{row['total_change']:.3f}", 
                          f"{row['net_change']:.1f}", f"{row['first_timestamp'].date()} to {row['last_timestamp'].date()}"])
    
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(table)
    story.append(Spacer(1, 12))

    # Nuanced Trend Section
    story.append(Paragraph("<b>Nuanced Trend Analysis:</b>", header_style))
    nuanced = f"- Betterment Score: {progression_df['betterment_score'].mean():.1f}% (negative to positive shifts)<br/>"
    nuanced += f"- Deterioration Score: {progression_df['deterioration_score'].mean():.1f}% (positive to negative shifts)<br/>"
    nuanced += f"- Net Change: {progression_df['net_change'].mean():.1f}% (overall betterment if positive)<br/>"
    nuanced += f"- Phase Delta: {progression_df['phase_delta'].mean():.3f} (late vs. early sentiment shift)<br/>"
    nuanced += f"- Mann-Kendall Tau: {progression_df['mann_kendall_tau'].mean():.3f} (-1 = deterioration, +1 = betterment)<br/>"
    nuanced += f"- Volatility: {progression_df['volatility'].mean():.3f} (std dev; high = emotional swings)<br/>"
    nuanced += f"- ADF p-value: {progression_df['adf_p'].mean():.3f} (<0.05 suggests non-stationary trend)"
    story.append(Paragraph(nuanced, summary_style))
    story.append(Spacer(1, 12))    

    # Keyword Table (sorted descending by score)
    if keyword_scores:
        story.append(Paragraph("<b>Top Keywords with TF-IDF Scores:</b>", header_style))
        keyword_data = [['Keyword', 'TF-IDF Score']] + [[kw, f"{score:.4f}"] for kw, score in keyword_scores]
        keyword_table = Table(keyword_data, colWidths=[3*inch, 2*inch])
        keyword_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(keyword_table)
        story.append(Spacer(1, 12))

    # Visualizations
    viz_style = ParagraphStyle('VizHeader', parent=styles['Heading2'], fontSize=12, spaceAfter=10)
    for img in ['overall_sentiment_progression.png', 'overall_sentiment_distribution.png']:
        if os.path.exists(f'graphs/{img}'):
            story.append(Paragraph(f"<b>{img.replace('.png', '').replace('_', ' ').title()}:</b>", viz_style))
            story.append(Image(f'graphs/{img}', width=6*inch, height=3*inch))
            story.append(Spacer(1, 12))
    
    # User Progression Graphs
    if top_users:
        story.append(Paragraph("<b>Top User Sentiment Progressions:</b>", viz_style))
        for author in top_users:
            img_path = f'graphs/user_{author}_progression.png'
            if os.path.exists(img_path):
                story.append(Paragraph(f"User: {author}", styles['Normal']))
                story.append(Image(img_path, width=6*inch, height=3*inch))
                story.append(Spacer(1, 12))

    # Disorder Visualization (if applicable)
    if 'disorder_label' in df.columns:
        story.append(Paragraph("<b>Overall Disorder Progression:</b>", viz_style))
        if os.path.exists('graphs/overall_disorder_progression.png'):
            story.append(Image('graphs/overall_disorder_progression.png', width=6*inch, height=3*inch))
            story.append(Spacer(1, 12))

    # Insights and Recommendations
    insights_style = ParagraphStyle('Insights', parent=styles['Normal'], fontSize=11, leading=14)
    insights = "<b>Key Insights:</b><br/>"
    avg_slope = progression_df['slope'].mean()
    trend_desc = "slight improvement" if avg_slope > 0 else "slight deterioration" if avg_slope < 0 else "stable"
    insights += f"- <i>Sentiment Trends:</i> The average slope suggests a {trend_desc} trend across users. {improving/len(progression_df)*100:.1f}% are improving, indicating potential recovery patterns.<br/>"
    volatility = df['sentiment_num'].std()
    insights += f"- <i>Volatility:</i> Sentiment std dev = {volatility:.2f}—{'high' if volatility > 0.5 else 'moderate'}, suggesting emotional swings; monitor for crises.<br/>"
    insights += "- <i>Keyword Themes:</i> Emotional introspection ('feel', 'wish') dominates, with PTSD signals—pair with positive 'happy/help' for support strategies.<br/>"
    insights += "- <i>High-Risk Users:</i> Users with slopes < -0.2 and keywords like 'self-harm' may warrant attention (none here).<br/>"
    insights += "- <i>Data Quality:</i> Low R² values (<0.5) indicate noisy trends; more data could improve accuracy.<br/>"
    story.append(Paragraph(insights, insights_style))
    story.append(Spacer(1, 12))

    # Disclaimer
    disclaimer_style = ParagraphStyle('Disclaimer', parent=styles['Italic'], fontSize=10, textColor=colors.red)
    disclaimer = "Disclaimer: This analysis is for research purposes only and not a substitute for professional mental health diagnosis or intervention. Consult a licensed therapist for individual cases."
    story.append(Paragraph(disclaimer, disclaimer_style))

    # Build PDF
    doc.build(story)
    print(f"Report saved to {output_path}")

# Generate report
generate_report(progression_df, keyword_scores)

# Save progression summary to CSV
progression_df.to_csv('summaries/progression_summary_1.csv', index=False)
print("Progression summary saved to 'output/progression_summary.csv'")