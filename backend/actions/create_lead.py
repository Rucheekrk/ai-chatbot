from db.connection import get_cursor

def create_leads_table():
    conn, cur = get_cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            name TEXT,
            phone TEXT,
            email TEXT,
            service_interest TEXT,
            created_at TIMESTAMP DEFAULT NOW()
            )
    """)
    
    conn.commit()
    cur.close()
    conn.close()


def create_lead(name, phone, email, service_interest):
    conn, cur = get_cursor()
    cur.execute("""
        INSERT INTO leads (name, phone, email, service_interest)
        VALUES (%s,%s,%s,%s)
    """, (name, phone, email, service_interest))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success", "message": "Thanks! Our team will follow up with you shortly."}

create_leads_table()
