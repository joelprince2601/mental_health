import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import contractions

# Download required NLTK data
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

def replace_url(text):
    """Replace URLs with 'URL'."""
    return re.sub(r'https?:\/\/\S*|www\.\S+', 'URL', text)

def remove_html(text):
    """Remove HTML tags."""
    return re.sub(r'<.*?>', '', text)

def replace_mentions(text):
    """Replace mentions with 'user'."""
    return re.sub(r'@\S*', 'user', text, flags=re.IGNORECASE)

def replace_num(text):
    """Replace numbers with 'NUMBER'."""
    return re.sub(r'^[+-]*?\d{1,3}[- ]*?\d{1,10}|\d{10}', 'NUMBER', text)

def replace_heart(text):
    """Replace '<3' with 'HEART'."""
    return re.sub(r'<3', 'HEART', text)

def remove_alphanumeric(text):
    """Remove alphanumeric strings containing digits."""
    return re.sub(r'\w*\d+\w*', '', text)

def remove_stopwords(text):
    """Remove English stopwords."""
    stop_words = set(stopwords.words('english')) - {'myself', 'me', 'i', 'my', 'dont'}
    return ' '.join(word for word in text.split() if word.lower() not in stop_words)

def remove_punctuations(text):
    """Remove punctuation."""
    return ''.join(word for word in text if word not in string.punctuation)

def lemmatization(text):
    """Lemmatize words to their root form (verbs)."""
    return ' '.join(lemmatizer.lemmatize(word, pos='v') for word in text.split())

def clean_text(text):
    """Apply all preprocessing steps."""
    if not isinstance(text, str):
        text = str(text)
    text = contractions.fix(text)
    text = text.lower()
    text = replace_url(text)
    text = remove_html(text)
    text = replace_mentions(text)
    text = replace_num(text)
    text = replace_heart(text)
    text = remove_alphanumeric(text)
    text = remove_stopwords(text)
    text = remove_punctuations(text)
    text = lemmatization(text)
    return text.strip()

if __name__ == "__main__":
    # Example usage
    sample_text = "Hey @user123, check out https://example.com! Feeling <3 but stressed about 12345 things."
    cleaned_text = clean_text(sample_text)
    print(f"Original: {sample_text}")
    print(f"Cleaned: {cleaned_text}")