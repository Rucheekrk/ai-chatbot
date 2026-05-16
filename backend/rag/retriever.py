from db.connection import get_cursor
from config import RAG_MIN_SCORE, RAG_TOP_K
from rag.embedder import embed


def retrieve(text):
    embedding_vector = embed(text)

    conn, cur = get_cursor()
    cur.execute("""SELECT content, doc, 1 - (embedding <=> %s::vector) AS score
        FROM documents
        WHERE business = 'lawn'
        ORDER BY score DESC
        LIMIT %s
        """, (embedding_vector, RAG_TOP_K))
    
    rows = cur.fetchall()
    cur.close()
    conn.close()

    results = [
        {"content": row[0], "doc": row[1], "score": row[2]}
        for row in rows
        if row[2] >= RAG_MIN_SCORE
    ]
    
    return results