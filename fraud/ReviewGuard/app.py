"""
ReviewGuard Dashboard - Fixed Stats, RAG Chat, and Verified Reviews
"""
import streamlit as st
import requests
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime

st.set_page_config(
    page_title="ReviewGuard - Fraud Detection System",
    page_icon="🛡️",
    layout="wide"
)

# Configuration
API_URL = "http://localhost:8000"

st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .auto-flag-badge {
        background-color: #dc2626;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .verified-badge {
        background-color: #059669;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
    }
</style>
""", unsafe_allow_html=True)

# Helper function
def get_products_map():
    try:
        response = requests.get(f"{API_URL}/products", timeout=2)
        if response.status_code == 200:
            return {p['id']: p for p in response.json()['products']}
    except:
        pass
    return {}

# Sidebar
with st.sidebar:
    st.markdown("## 🛡️ ReviewGuard")
    page = st.radio("Navigate", ["📊 Dashboard", "🏪 Products", "📝 Reviews", "🔍 Analyze", "💬 AI Assistant"])
    
    try:
        requests.get(f"{API_URL}/", timeout=1)
        st.success("✅ API Online")
    except:
        st.error("❌ API Offline")
        st.info("Run: `python api.py`")

# Dashboard
if page == "📊 Dashboard":
    st.markdown('<h1 class="main-header">📊 Dashboard</h1>', unsafe_allow_html=True)
    
    try:
        stats = requests.get(f"{API_URL}/stats").json()
        
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total Reviews", stats['total_reviews'])
        col2.metric("Genuine", stats['genuine_count'])
        col3.metric("Fraudulent", stats['fraudulent_count'])
        col4.metric("Flagged", stats.get('flagged_count', 0)) # Fixed key access
        
        st.markdown("---")
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Distribution")
            fig = go.Figure(data=[go.Pie(
                labels=['Genuine', 'Suspicious', 'Fraudulent'],
                values=[stats['genuine_count'], stats['suspicious_count'], stats['fraudulent_count']],
                hole=0.4
            )])
            st.plotly_chart(fig, use_container_width=True)
            
        with col2:
            st.subheader("Authenticity Score")
            fig = go.Figure(go.Indicator(
                mode="gauge+number",
                value=stats['average_authenticity'],
                gauge={'axis': {'range': [0, 100]}, 'bar': {'color': "#667eea"}}
            ))
            st.plotly_chart(fig, use_container_width=True)
            
    except Exception as e:
        st.info("No data available yet or API offline.")

# Products Page
elif page == "🏪 Products":
    st.markdown('<h1 class="main-header">🏪 Products</h1>', unsafe_allow_html=True)
    try:
        prods = requests.get(f"{API_URL}/products").json()['products']
        if prods:
            for p in prods:
                with st.expander(f"{p['name']} ({p['category']})"):
                    col1, col2, col3 = st.columns(3)
                    col1.metric("Reviews", p['review_count'])
                    score = p.get('avg_fraud_score', 0) or 0
                    col2.metric("Avg Fraud Score", f"{score:.1%}")
                    col3.metric("Flagged Reviews", p.get('flagged_count', 0))
        else:
            st.info("No products found.")
    except:
        st.error("Failed to load products.")

# Reviews Page
elif page == "📝 Reviews":
    st.markdown('<h1 class="main-header">📝 Reviews</h1>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    filter_label = col1.selectbox("Filter", ["All", "genuine", "suspicious", "fraudulent"])
    flagged_only = col2.checkbox("Flagged Only")
    verified_only = col3.checkbox("Verified Only")
    
    try:
        params = {}
        if filter_label != "All": params['label'] = filter_label
        if flagged_only: params['flagged_only'] = 'true'
        if verified_only: params['verified_only'] = 'true'
        
        reviews = requests.get(f"{API_URL}/reviews", params=params).json()['reviews']
        st.caption(f"Showing {len(reviews)} reviews")
        
        for r in reviews:
            with st.expander(f"{r['label'].upper()} - {r['fraud_prob']:.0%} Fraud Risk"):
                st.write(r['text'])
                st.caption(f"ID: {r['id']} | Product: {r['product_id']}")
                
                # Fixed: Correctly checking 'verified' key
                if r.get('verified'):
                    st.markdown('<span class="verified-badge">VERIFIED</span>', unsafe_allow_html=True)
                
                if r.get('auto_flagged'):
                    st.markdown('<span class="auto-flag-badge">AUTO-FLAGGED</span>', unsafe_allow_html=True)
                
                # Flag button
                if st.button("Flag/Unflag", key=r['id']):
                    new_val = not bool(r.get('flagged', 0))
                    requests.post(f"{API_URL}/flag", json={"review_id": r['id'], "flagged": new_val})
                    st.rerun()
                    
    except Exception as e:
        st.error(f"Error loading reviews: {str(e)}")

# Analyze Page
elif page == "🔍 Analyze":
    st.markdown('<h1 class="main-header">🔍 Analyze Review</h1>', unsafe_allow_html=True)
    
    products_map = get_products_map()
    prod_options = {p['id']: f"{p['name']}" for p in products_map.values()}
    
    with st.form("analyze"):
        text = st.text_area("Review Text")
        pid = st.selectbox("Product", list(prod_options.keys()), format_func=lambda x: prod_options.get(x, x))
        if st.form_submit_button("Analyze"):
            res = requests.post(f"{API_URL}/analyze", json={"text": text, "product_id": pid}).json()
            
            st.markdown("---")
            if res.get('auto_flagged'):
                st.error("🚨 THIS REVIEW WAS AUTO-FLAGGED AS HIGH RISK")
            
            col1, col2 = st.columns(2)
            col1.metric("Fraud Probability", f"{res['fraud_probability']:.1%}")
            col2.metric("Verdict", res['label'].upper())
            
            st.success("Review analyzed and saved!")

# Chat Page
elif page == "💬 AI Assistant":
    st.markdown('<h1 class="main-header">💬 AI Assistant</h1>', unsafe_allow_html=True)
    
    products_map = get_products_map()
    prod_options = {"": "General Questions"}
    prod_options.update({p['id']: p['name'] for p in products_map.values()})
    
    selected_prod = st.selectbox("Context (Select Product)", list(prod_options.keys()), format_func=lambda x: prod_options[x])
    
    if "messages" not in st.session_state:
        st.session_state.messages = [{"role": "assistant", "content": "How can I help you regarding fraud detection?"}]
        
    for m in st.session_state.messages:
        with st.chat_message(m["role"]):
            st.write(m["content"])
            
    if prompt := st.chat_input("Ask a question..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.write(prompt)
            
        with st.chat_message("assistant"):
            with st.spinner("Analyzing context..."):
                try:
                    payload = {"message": prompt}
                    if selected_prod:
                        payload["product_id"] = selected_prod
                        
                    res = requests.post(f"{API_URL}/chat", json=payload, timeout=100)
                    reply = res.json()['response']
                    st.write(reply)
                    st.session_state.messages.append({"role": "assistant", "content": reply})
                except Exception as e:
                    st.error("AI Service Timeout or Error. Try again.")
