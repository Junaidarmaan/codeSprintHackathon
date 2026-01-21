# 🛡️ ReviewGuard - AI Fraud Detection System

**ReviewGuard** is a comprehensive E-commerce Fraud Detection system designed to identify fake, suspicious, and fraudulent product reviews in real-time. It combines **Machine Learning (TF-IDF + Random Forest)** with a **RAG-enabled AI Chatbot** (using Ollama's phi3:mini) to provide transparent, explainable fraud analysis.

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Model](https://img.shields.io/badge/Model-RandomForest-orange)
![AI](https://img.shields.io/badge/AI-Ollama_Phi3-purple)

---

## 🚀 Key Features

*   **🔍 ML & Heuristic Detection**:
    *   **Machine Learning**: Trained on 10,000 real fake/genuine reviews (87% Accuracy).
    *   **Smart Heuristics**: Detects "All Caps" shouting, "Scam" keywords, and suspicious short reviews.
    *   **Auto-Flagging**: Automatically flags reviews with >70% fraud probability.
*   **🛒 Product Integration**:
    *   Pre-loaded with **20 Products** (Electronics, Home, Sports, etc.).
    *   Tracks fraud statistics per product.
*   **🤖 RAG AI Assistant**:
    *   Chat with an AI that knows the product context.
    *   Retrieves recent reviews and product details to answer questions accurately.
    *   Example: *"What do people say about the battery life?"*
*   **📊 Interactive Dashboard**:
    *   Real-time analytics and visualizations.
    *   Manual review flagging and management.
    *   Authenticity probability gauge.

---

## 🛠️ Technology Stack

*   **Backend**: FastAPI (Python)
*   **Frontend**: Streamlit
*   **Machine Learning**: Scikit-Learn (TF-IDF, Random Forest)
*   **Database**: SQLite
*   **AI/LLM**: Ollama (`phi3:mini`)
*   **Visualization**: Plotly

---

## 📦 Installation

### 1. Prerequisites
*   **Python 3.10+** installed.
*   **Ollama** installed and running.
    *   Run: `ollama pull phi3:mini`

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Database & Model
The system comes with a pre-trained model (`fraud_model.joblib`), but you can retrain it if needed:
```bash
# Optional: Retrain model on your dataset
python model.py "path/to/dataset.csv"
```

---

## 🏃‍♂️ Usage Guide

### Step 1: Start the Backend API
Open a terminal and run:
```bash
python api.py
```
*   Expected Output: `Uvicorn running on http://0.0.0.0:8000`

### Step 2: Launch the Dashboard
Open a **new** terminal and run:
```bash
streamlit run app.py
```
*   Expected Output: `Local URL: http://localhost:8501`

### Step 3: Explore the Features
1.  **📊 Dashboard**: View overall fraud stats (Genuine vs. Fraudulent).
2.  **🏪 Products**: See all 20 tracked products and their fraud scores.
3.  **🔍 Analyze**: Enter a review text to check its authenticity.
    *   *Try*: "THIS IS A SCAM DO NOT BUY!" -> Result: **FRAUDULENT**
    *   *Try*: "The battery lasts about 10 hours, very happy." -> Result: **GENUINE**
4.  **💬 AI Assistant**: Select a product and ask questions.
    *   *Ask*: "Is this product trustworthy?"

---

## 📂 Project Structure

```
ReviewGuard/
├── api.py                 # FastAPI Backend (Endpoints for ML, Database, Chat)
├── app.py                 # Streamlit Frontend (Dashboard UI)
├── model.py               # ML Model Definition & Training Logic
├── fraud_model.joblib     # Trained Random Forest Model
├── reviews.db             # SQLite Database (Products & Reviews)
├── requirements.txt       # Python Dependencies
└── README.md              # Project Documentation
```

---

## 🧪 Testing
We have verified the system's accuracy with automated tests.
*   **Genuine Detection**: Confirmed (<50% fraud score).
*   **Fraud Detection**: Confirmed (>80% fraud score).
*   **Chatbot Speed**: Optimized for <10s response time.

> **Note**: If you want to reset the database, simply delete `reviews.db` and restart `api.py`. It will auto-regenerate.
