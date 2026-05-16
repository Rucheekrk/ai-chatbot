import psycopg2
from config import DATABASE_URL

def get_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def get_cursor():
    conn = get_connection()
    cur = conn.cursor()
    return conn, cur