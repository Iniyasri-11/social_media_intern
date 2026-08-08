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


def get_db():
    """Dependency generator for providing a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
