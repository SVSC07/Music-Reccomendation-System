from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import os
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Global variables to store data
df = None
numerical_features = ["danceability", "energy", "tempo", "Valence"]
DB_PATH = "query_logs.db"

def initialize_database():
    """Initialize SQLite database for query logging"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create query_logs table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                query TEXT NOT NULL,
                query_type TEXT,
                num_results INTEGER,
                success INTEGER DEFAULT 1,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")
        return True
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False

def log_query(query, query_type="recommendation", num_results=0, success=True):
    """Log a user query to the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        now = datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")
        
        cursor.execute('''
            INSERT INTO query_logs (date, time, query, query_type, num_results, success)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (date_str, time_str, query, query_type, num_results, 1 if success else 0))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging query: {e}")

def load_and_process_data():
    """Load and process the dataset"""
    global df
    try:
        # Load the dataset
        df = pd.read_csv("Hindi_songs.csv")
        df = df.sample(n=1000, random_state=42).reset_index(drop=True)
        
        # Select relevant numerical features for clustering
        scaler = StandardScaler()
        df_scaled = pd.DataFrame(scaler.fit_transform(df[numerical_features]), columns=numerical_features)
        
        # Apply K-Means clustering
        optimal_k = 4
        kmeans = KMeans(n_clusters=optimal_k, random_state=42)
        df_scaled_cleaned = df_scaled.dropna()
        cluster_labels = kmeans.fit_predict(df_scaled_cleaned)
        
        # Assign cluster labels
        df["Cluster"] = pd.NA
        df.loc[df_scaled_cleaned.index, "Cluster"] = cluster_labels.astype(int)
        
        print(f"Dataset loaded successfully! Shape: {df.shape}")
        return True
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return False

def recommend_songs(song_name, num_recommendations=5):
    """Get song recommendations"""
    try:
        # Check if input song exists
        if song_name not in df["song_name"].values:
            return {"error": f"Song '{song_name}' not found in dataset"}
        
        # Get the cluster of the input song
        song_cluster = df.loc[df["song_name"] == song_name, "Cluster"].values[0]
        
        # Filter songs from the same cluster
        same_cluster_songs = df[df["Cluster"] == song_cluster].copy()
        
        # Calculate cosine similarity within the cluster
        song_index_in_cluster = same_cluster_songs[same_cluster_songs["song_name"] == song_name].index[0]
        cluster_features = same_cluster_songs[numerical_features]
        similarity = cosine_similarity(cluster_features, cluster_features)
        
        # Get top recommendations (excluding the same song)
        similar_song_indices_in_cluster = np.argsort(similarity[same_cluster_songs.index.get_loc(song_index_in_cluster)])[-(num_recommendations + 1):-1][::-1]
        recommended_songs_original_indices = same_cluster_songs.iloc[similar_song_indices_in_cluster].index
        
        recommendations = df.loc[recommended_songs_original_indices][["song_name", "released_date", "singer"]]
        
        return {
            "success": True,
            "original_song": song_name,
            "recommendations": recommendations.to_dict('records')
        }
    except Exception as e:
        return {"error": str(e)}

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('.', filename)

@app.route('/api/songs')
def get_songs():
    """Get all song names for autocomplete"""
    try:
        if df is not None:
            songs = df[['song_name', 'singer', 'released_date']].to_dict('records')
            return jsonify({
                "success": True,
                "songs": songs,
                "total": len(songs)
            })
        else:
            return jsonify({"error": "Dataset not loaded"})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """Get recommendations for a song"""
    try:
        data = request.get_json()
        song_name = data.get('song_name', '').strip()
        num_recommendations = data.get('num_recommendations', 5)
        
        if not song_name:
            log_query(song_name or "(empty)", "recommendation", 0, False)
            return jsonify({"error": "Song name is required"})
        
        result = recommend_songs(song_name, num_recommendations)
        
        # Log the query
        success = 'error' not in result
        num_results = len(result.get('recommendations', [])) if success else 0
        log_query(song_name, "recommendation", num_results, success)
        
        return jsonify(result)
    
    except Exception as e:
        log_query(song_name if 'song_name' in locals() else "(error)", "recommendation", 0, False)
        return jsonify({"error": str(e)})

@app.route('/api/dataset-info')
def get_dataset_info():
    """Get dataset information"""
    try:
        if df is not None:
            cluster_counts = df["Cluster"].value_counts().sort_index().to_dict()
            return jsonify({
                "success": True,
                "total_songs": len(df),
                "clusters": len(cluster_counts),
                "features": len(numerical_features),
                "cluster_distribution": cluster_counts
            })
        else:
            return jsonify({"error": "Dataset not loaded"})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/api/query-logs')
def get_query_logs():
    """Get all logged queries"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get optional limit parameter
        limit = request.args.get('limit', 100, type=int)
        
        cursor.execute('''
            SELECT id, date, time, query, query_type, num_results, success, timestamp
            FROM query_logs
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        logs = []
        for row in rows:
            logs.append({
                "id": row[0],
                "date": row[1],
                "time": row[2],
                "query": row[3],
                "query_type": row[4],
                "num_results": row[5],
                "success": bool(row[6]),
                "timestamp": row[7]
            })
        
        return jsonify({
            "success": True,
            "total_logs": len(logs),
            "logs": logs
        })
    
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    print("Starting Hindi Music Recommendation System...")
    
    # Initialize database
    initialize_database()
    
    if load_and_process_data():
        print("✅ Dataset loaded and processed successfully!")
        print("🚀 Starting Flask server...")
        print("🌐 Open your browser and go to: http://localhost:5000")
        print("📊 Query logs are stored in: query_logs.db")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to load dataset. Please check if 'Hindi_songs.csv' exists.")