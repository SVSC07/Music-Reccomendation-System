import sqlite3
import os
import shutil
from datetime import datetime
from pathlib import Path

DB_PATH = 'music_recommender.db'
BACKUP_DIR = 'backups'

def get_db_connection():
    """Create a database connection with WAL mode enabled"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for better concurrent access
    conn.execute('PRAGMA journal_mode=WAL')
    # Optional: Configure WAL settings
    conn.execute('PRAGMA synchronous=NORMAL')
    return conn

def init_db():
    """Initialize the database schema"""
    conn = get_db_connection()
    # ...existing code...
    conn.close()

def create_backup():
    """Create a backup of the current database"""
    # Ensure backup directory exists
    Path(BACKUP_DIR).mkdir(exist_ok=True)
    
    # Generate backup filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(BACKUP_DIR, f'music_recommender_{timestamp}.db')
    
    # Use SQLite's backup API for consistent backup
    source = sqlite3.connect(DB_PATH)
    dest = sqlite3.connect(backup_path)
    
    with dest:
        source.backup(dest)
    
    source.close()
    dest.close()
    
    print(f"Backup created: {backup_path}")
    return backup_path

def cleanup_old_backups(keep_count=10):
    """Remove old backups, keeping only the most recent ones"""
    if not os.path.exists(BACKUP_DIR):
        return
    
    backups = sorted(
        [f for f in os.listdir(BACKUP_DIR) if f.endswith('.db')],
        reverse=True
    )
    
    for old_backup in backups[keep_count:]:
        os.remove(os.path.join(BACKUP_DIR, old_backup))
        print(f"Removed old backup: {old_backup}")