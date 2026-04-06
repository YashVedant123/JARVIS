import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "jarvis.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY,
            name TEXT,
            address_as TEXT,
            use_case TEXT,
            onboarded INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()