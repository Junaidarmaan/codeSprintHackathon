"""
ReviewGuard API - Fixed Schema, RAG Chatbot, and Accurate Stats
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from model import FraudDetector
import sqlite3
from datetime import datetime
import uuid
import os

app = FastAPI(title="ReviewGuard API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Load model
detector = FraudDetector()
if os.path.exists('fraud_model.joblib'):
    detector.load('fraud_model.joblib')

# Database
DB_PATH = 'reviews.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Clean up old tables if needed (optional, but good for dev)
    # c.execute("DROP TABLE IF EXISTS reviews")
    # c.execute("DROP TABLE IF EXISTS products")
    
    # Reviews Table
    c.execute('''CREATE TABLE IF NOT EXISTS reviews
                 (id TEXT PRIMARY KEY, product_id TEXT, text TEXT, rating INTEGER,
                  fraud_prob REAL, label TEXT, confidence REAL, 
                  flagged INTEGER DEFAULT 0,
                  auto_flagged INTEGER DEFAULT 0, 
                  verified INTEGER DEFAULT 0,
                  timestamp TEXT)''')
    
    # Products Table
    c.execute('''CREATE TABLE IF NOT EXISTS products
                 (id TEXT PRIMARY KEY, name TEXT, category TEXT)''')
    
    # Insert Products
    products = [
        # Electronics
        ('PROD001', 'Wireless Headphones', 'Electronics'),
        ('PROD006', 'Smart Watch Series 5', 'Electronics'),
        ('PROD007', '4K Gaming Monitor', 'Electronics'),
        ('PROD008', 'Bluetooth Speaker', 'Electronics'),
        
        # Home & Kitchen
        ('PROD002', 'Kitchen Blender', 'Home & Kitchen'),
        ('PROD009', 'Air Fryer XXL', 'Home & Kitchen'),
        ('PROD010', 'Ceramic Knife Set', 'Home & Kitchen'),
        ('PROD011', 'Non-Stick Frying Pan', 'Home & Kitchen'),
        
        # Sports
        ('PROD003', 'Yoga Mat', 'Sports'),
        ('PROD012', 'Adjustable Dumbbells', 'Sports'),
        ('PROD013', 'Running Treadmill', 'Sports'),
        ('PROD014', 'Resistance Bands', 'Sports'),
        
        # Appliances
        ('PROD004', 'Coffee Maker', 'Appliances'),
        ('PROD015', 'Robot Vacuum Cleaner', 'Appliances'),
        ('PROD016', 'Microwave Oven', 'Appliances'),
        ('PROD017', 'Electric Kettle', 'Appliances'),
        
        # Office
        ('PROD005', 'Laptop Stand', 'Office'),
        ('PROD018', 'Ergonomic Office Chair', 'Office'),
        ('PROD019', 'Mechanical Keyboard', 'Office'),
        ('PROD020', 'Webcam 1080p', 'Office')
    ]
    c.executemany('INSERT OR IGNORE INTO products VALUES (?,?,?)', products)
    conn.commit()
    conn.close()

init_db()

class ReviewRequest(BaseModel):
    text: str
    rating: int = 5
    product_id: str = "PROD001"

class ChatRequest(BaseModel):
    message: str
    product_id: str = None

class FlagRequest(BaseModel):
    review_id: str
    flagged: bool

@app.get("/")
def root():
    return {"message": "ReviewGuard API", "status": "online", "features": ["RAG Chatbot", "Auto-Flagging", "Product Stats"]}

@app.get("/products")
def get_products():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    products = conn.execute('''
        SELECT p.*, 
               COUNT(r.id) as review_count, 
               AVG(r.fraud_prob) as avg_fraud_score,
               SUM(CASE WHEN r.flagged=1 OR r.auto_flagged=1 THEN 1 ELSE 0 END) as flagged_count
        FROM products p 
        LEFT JOIN reviews r ON p.id = r.product_id
        GROUP BY p.id
    ''').fetchall()
    conn.close()
    return {"products": [dict(p) for p in products]}

@app.post("/analyze")
def analyze_review(req: ReviewRequest):
    # ML Prediction
    result = detector.predict(req.text)
    
    words = req.text.split()
    word_count = len(words)
    keywords = ["scam", "fake", "fraud", "con", "don't buy", "do not buy", "worst ever"]
    
    # 1. HEURISTIC: Too Short (< 3 words)
    # Short reviews are often lazy fakes or spam, but not always malicious.
    if word_count < 3:
        # If ML thought it was genuine, bump it to suspicious
        if result['fraud_probability'] < 0.4:
            result['fraud_probability'] = 0.55
            result['label'] = 'suspicious'
        # CAP score for short reviews if no bad keywords found
        # (Prevents "Good." from being marked as Scam)
        elif result['fraud_probability'] > 0.65 and not any(k in req.text.lower() for k in keywords):
             result['fraud_probability'] = 0.65
             result['label'] = 'suspicious'
    
    # 2. HEURISTIC: ALL CAPS (Shouting)
    # Strong indicator of fake/spam
    if req.text.isupper() and len(req.text) > 10:
        if result['fraud_probability'] < 0.8:
            result['fraud_probability'] = max(result['fraud_probability'], 0.85)
            result['label'] = 'fraudulent'
            
    # 3. HEURISTIC: Scam/Fake Keywords
    if any(k in req.text.lower() for k in keywords):
         if result['fraud_probability'] < 0.7:
            result['fraud_probability'] = max(result['fraud_probability'], 0.75)
            result['label'] = 'fraudulent'

    # 4. HEURISTIC: Detailed Genuine Review (STRONG DAMPING)
    # If the review is long (>15 words), mixed case, and no bad keywords, trust it more.
    # This fixes the "False Positive" issue for genuine enthusiastic reviews.
    if word_count > 15 and not req.text.isupper() and not any(k in req.text.lower() for k in keywords):
        # Reduce fraud score by 40% (0.6x) to trust detailed reviews more
        result['fraud_probability'] = result['fraud_probability'] * 0.6
        
        # If it drops below 50%, mark genuine
        if result['fraud_probability'] < 0.5:
             result['label'] = 'genuine'
        elif result['fraud_probability'] < 0.7:
             result['label'] = 'suspicious'

    # Auto-flagging Logic (> 70%)
    auto_flagged = 1 if result['fraud_probability'] > 0.7 else 0
    
    review_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""INSERT INTO reviews VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
             (review_id, req.product_id, req.text, req.rating,
              result['fraud_probability'], result['label'], result['confidence'],
              0, auto_flagged, 0, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    
    return {
        "review_id": review_id,
        **result,
        "auto_flagged": bool(auto_flagged),
        "product_id": req.product_id
    }

@app.get("/reviews")
def get_reviews(product_id: str = None, flagged_only: bool = False, verified_only: bool = False, label: str = None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    query = "SELECT * FROM reviews WHERE 1=1"
    params = []
    
    if product_id:
        query += " AND product_id=?"
        params.append(product_id)
    if flagged_only:
        query += " AND (flagged=1 OR auto_flagged=1)"
    if verified_only:
        query += " AND verified=1"
    if label:
        query += " AND label=?"
        params.append(label)
        
    query += " ORDER BY timestamp DESC LIMIT 100"
    
    reviews = conn.execute(query, params).fetchall()
    conn.close()
    return {"reviews": [dict(r) for r in reviews]}

@app.post("/flag")
def flag_review(req: FlagRequest):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE reviews SET flagged=? WHERE id=?", (1 if req.flagged else 0, req.review_id))
    conn.commit()
    conn.close()
    return {"success": True}

@app.get("/stats")
def get_stats():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    stats = c.execute('''
        SELECT COUNT(*) as total,
               SUM(CASE WHEN label='genuine' THEN 1 ELSE 0 END) as genuine,
               SUM(CASE WHEN label='suspicious' THEN 1 ELSE 0 END) as suspicious,
               SUM(CASE WHEN label='fraudulent' THEN 1 ELSE 0 END) as fraudulent,
               SUM(CASE WHEN auto_flagged=1 THEN 1 ELSE 0 END) as auto_flagged,
               SUM(CASE WHEN flagged=1 OR auto_flagged=1 THEN 1 ELSE 0 END) as total_flagged,
               SUM(CASE WHEN verified=1 THEN 1 ELSE 0 END) as verified,
               AVG(CASE WHEN label='genuine' THEN (1-fraud_prob)*100 ELSE 0 END) as avg_auth
        FROM reviews
    ''').fetchone()
    conn.close()
    
    return {
        "total_reviews": stats[0] or 0,
        "genuine_count": stats[1] or 0,
        "suspicious_count": stats[2] or 0,
        "fraudulent_count": stats[3] or 0,
        "auto_flagged_count": stats[4] or 0,
        "flagged_count": stats[5] or 0,  # Fixed: Added flagged_count
        "verified_count": stats[6] or 0, # Fixed: Added verified_count
        "average_authenticity": round(stats[7] or 0, 1)
    }

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        # RAG Pipeline
        rag_context = ""
        context_msg = "You are a helpful fraud detection assistant."
        
        if req.product_id and req.product_id != "General Questions":
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            
            # Fetch Product Info
            prod = conn.execute("SELECT * FROM products WHERE id=?", (req.product_id,)).fetchone()
            
            # Fetch Recent Reviews (Verified first, then genuine)
            # LIMIT to 3 reviews (was 5) for speed
            reviews = conn.execute('''
                SELECT text, label, fraud_prob FROM reviews 
                WHERE product_id=? 
                ORDER BY verified DESC, timestamp DESC LIMIT 3
            ''', (req.product_id,)).fetchall()
            conn.close()
            
            if prod:
                rag_context += f"Product: {prod['name']} ({prod['category']})\n"
            
            if reviews:
                rag_context += "Recent Reviews:\n"
                for r in reviews:
                    # Truncate to 150 chars (was 200)
                    rag_context += f"- [{r['label'].upper()}] {r['text'][:150]}...\n"
            
            context_msg = f"""You are analyzing the product '{prod['name']}'.
Here is the context data:
{rag_context}

User Question: {req.message}
Answer briefly based on the reviews."""
        
        else:
            context_msg = f"User Question: {req.message}\nAnswer generally about fraud detection."

        # Call Ollama
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3:mini",
                "prompt": context_msg,
                "stream": False,
                # Optimize Model Parameters for Speed
                "options": {
                    "temperature": 0.3,
                    "num_predict": 128,  # Limit response to 128 tokens
                    "num_ctx": 2048      # Reduce context window if possible
                }
            },
            timeout=90 # Keep internal timeout high just in case
        )
        
        if response.status_code == 200:
            return {"response": response.json().get('response', 'No response')}
        else:
            return {"response": "AI unavailable"}
            
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
