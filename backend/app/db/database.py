"""
app/db/database.py

SQLAlchemy database initialization.
Supports SQLite (stored locally in data/app.db) by default,
or PostgreSQL if DATABASE_URL is configured in the environment.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Ensure data directory exists for local SQLite database
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
DEFAULT_DB_PATH = os.path.join(DATA_DIR, "app.db")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Create all database tables if they do not exist."""
    Base.metadata.create_all(bind=engine)


def seed_db():
    """Seed the database with sample data on first run."""
    from app.db.models import User, Post
    from sqlalchemy.orm import Session
    import hashlib

    db = SessionLocal()
    try:
        # Check if data already seeded
        user_count = db.query(User).count()
        if user_count > 0:
            return  # Already seeded

        # Create sample users
        sample_users = [
            User(
                username="alice_verified",
                email="alice@example.com",
                password_hash=hashlib.sha256("password123".encode()).hexdigest(),
                name="Alice Verified",
                bio="Data journalist and fact-checker",
                avatar="https://api.example.com/avatar/alice",
                is_verified=True,
                website="https://alice.example.com",
            ),
            User(
                username="bob_explorer",
                email="bob@example.com",
                password_hash=hashlib.sha256("password123".encode()).hexdigest(),
                name="Bob Explorer",
                bio="Technology enthusiast",
                avatar="https://api.example.com/avatar/bob",
            ),
            User(
                username="carol_admin",
                email="carol@example.com",
                password_hash=hashlib.sha256("admin123".encode()).hexdigest(),
                name="Carol Admin",
                bio="Platform moderator",
                is_admin=True,
                is_verified=True,
            ),
        ]
        
        db.add_all(sample_users)
        db.commit()

    except Exception as e:
        print(f"Seeding error: {e}")
        db.rollback()
    finally:
        db.close()


def get_db():
    """Dependency generator for providing a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
