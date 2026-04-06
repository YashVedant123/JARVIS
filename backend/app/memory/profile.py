from app.memory.database import get_db

def get_profile():
    conn = get_db()
    profile = conn.execute("SELECT * FROM profile WHERE id = 1").fetchone()
    conn.close()
    return dict(profile) if profile else None

def save_profile(name: str, address_as: str, use_case: str):
    conn = get_db()
    conn.execute("DELETE FROM profile WHERE id = 1")
    conn.execute(
        "INSERT INTO profile (id, name, address_as, use_case, onboarded) VALUES (1, ?, ?, ?, 1)",
        (name, address_as, use_case)
    )
    conn.commit()
    conn.close()

def is_onboarded():
    profile = get_profile()
    return profile is not None and profile["onboarded"] == 1