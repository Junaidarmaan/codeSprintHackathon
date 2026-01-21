"""
Simple fraud detection model using your real dataset.
"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import re


class FraudDetector:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        
    def clean_text(self, text):
        """Clean review text."""
        text = str(text).lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        return text
    
    def train(self, csv_path, sample_size=10000):
        """Train model on dataset."""
        print(f"Loading dataset from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Sample data
        if sample_size and len(df) > sample_size:
            df = df.sample(n=sample_size, random_state=42)
        
        print(f"Training on {len(df)} reviews")
        print(f"  Fake (CG): {(df['label'] == 'CG').sum()}")
        print(f"  Genuine (OR): {(df['label'] == 'OR').sum()}")
        
        # Prepare data
        df['text_clean'] = df['text_'].apply(self.clean_text)
        X = df['text_clean']
        y = (df['label'] == 'CG').astype(int)  # 1 = fake, 0 = genuine
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Vectorize
        print("Vectorizing text...")
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        # Train
        print("Training model...")
        self.model.fit(X_train_vec, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_vec)
        train_score = self.model.score(X_train_vec, y_train)
        test_score = self.model.score(X_test_vec, y_test)
        
        print(f"\nTraining Accuracy: {train_score:.3f}")
        print(f"Test Accuracy: {test_score:.3f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['genuine', 'fake']))
        
        return {'train_accuracy': train_score, 'test_accuracy': test_score}
    
    def predict(self, text):
        """Predict if review is fake."""
        text_clean = self.clean_text(text)
        text_vec = self.vectorizer.transform([text_clean])
        
        fraud_prob = self.model.predict_proba(text_vec)[0][1]
        is_fake = self.model.predict(text_vec)[0]
        
        # Determine label
        if fraud_prob < 0.4:
            label = "genuine"
        elif fraud_prob < 0.7:
            label = "suspicious"
        else:
            label = "fraudulent"
        
        return {
            'fraud_probability': float(fraud_prob),
            'is_fake': bool(is_fake),
            'label': label,
            'confidence': float(max(fraud_prob, 1 - fraud_prob))
        }
    
    def save(self, path='fraud_model.joblib'):
        """Save model."""
        joblib.dump({
            'vectorizer': self.vectorizer,
            'model': self.model
        }, path)
        print(f"Model saved to {path}")
    
    def load(self, path='fraud_model.joblib'):
        """Load model."""
        data = joblib.load(path)
        self.vectorizer = data['vectorizer']
        self.model = data['model']
        print(f"Model loaded from {path}")


if __name__ == "__main__":
    import sys
    
    detector = FraudDetector()
    
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "c:/Users/mdkai/Desktop/New folder/fake reviews dataset.csv"
    
    # Train
    detector.train(csv_path, sample_size=10000)
    
    # Save
    detector.save('fraud_model.joblib')
    
    # Test
    test_reviews = [
        "This product is amazing! Best purchase ever!!!",
        "Good quality for the price. Arrived on time.",
        "SCAM!!! DO NOT BUY!!! WORST PRODUCT EVER!!!"
    ]
    
    print("\n" + "="*50)
    print("Testing on sample reviews:")
    print("="*50)
    for review in test_reviews:
        result = detector.predict(review)
        print(f"\nReview: {review[:50]}...")
        print(f"  Label: {result['label']}")
        print(f"  Fraud Probability: {result['fraud_probability']:.2%}")
