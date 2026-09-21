import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv()

# Fallback to local SQLite if DATABASE_URL is not set
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./growth_tracker.db"
)

# Configure engine arguments based on database dialect
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL connection configuration
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True  # Automatically reconnects broken connections
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema_up_to_date():
    """
    Ensures new columns like 'role' are added to existing database tables if created prior to RBAC update.
    """
    try:
        with engine.connect() as conn:
            if "sqlite" in SQLALCHEMY_DATABASE_URL:
                result = conn.execute(text("PRAGMA table_info(users)")).fetchall()
                column_names = [row[1] for row in result]
                if "role" not in column_names:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'parent'"))
                    conn.commit()
            else:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'parent';"))
                conn.commit()
    except Exception as e:
        print(f"Auto-migration note: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()