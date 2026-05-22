from db.connection import get_cursor

def create_handoffs_table():
    conn, cur = get_cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS handoffs (
            id SERIAL PRIMARY KEY,
            name TEXT,
            phone TEXT,
            email TEXT,
            reason TEXT,
            chat_summary TEXT,
            created_at TIMESTAMP DEFAULT NOW()
            )
        """)
    
    conn.commit()
    cur.close()
    conn.close()


def create_handoff(name, phone, email, reason, chat_summary):
    conn, cur = get_cursor()
    cur.execute("""
        INSERT INTO handoffs(name, phone, email, reason, chat_summary)
        VALUES (%s, %s, %s, %s, %s)
    """, (name, phone, email, reason, chat_summary))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success", "message": "Handoff created. Our team will contact you shortly."}

create_handoffs_table()
