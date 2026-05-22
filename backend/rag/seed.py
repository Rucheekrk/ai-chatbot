import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.connection import get_cursor
from rag.embedder import embed

KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "knowledge_base")


def create_table():
    conn, cur = get_cursor()
    cur.execute("""
        CREATE EXTENSION IF NOT EXISTS vector;

        CREATE TABLE IF NOT EXISTS documents(
                id SERIAL PRIMARY KEY,
                business TEXT,
                doc TEXT,
                content TEXT,
                embedding vector(1536)
            );        
    """)
    conn.commit()
    cur.close()
    conn.close()
    

def insert_document(business, doc, content):
    embedding_vector = embed(content)
    conn, cur = get_cursor()
    cur.execute("""
        INSERT INTO documents (business, doc, content, embedding)
        VALUES (%s,%s, %s, %s)
    """, (business, doc, content, embedding_vector))

    conn.commit()
    cur.close()
    conn.close()
    

def seed():
    create_table()
    for business in os.listdir(KNOWLEDGE_BASE_PATH):
        business_path = os.path.join(KNOWLEDGE_BASE_PATH, business)
        if not os.path.isdir(business_path):
            continue

        for filename in os.listdir(business_path):
            filename_path = os.path.join(business_path, filename)
            with open(filename_path, "r") as f:
                content = f.read()

            insert_document(business, filename, content)


if __name__ == "__main__":
    seed()
    print("Seeded successfully")