import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


BASE_DIR = Path(__file__).resolve().parent

def normalize_database_url(database_url: str) -> str:
    normalized = database_url.strip()
    if normalized.startswith("postgres://"):
        normalized = normalized.replace("postgres://", "postgresql+psycopg://", 1)
    elif normalized.startswith("postgresql://"):
        normalized = normalized.replace("postgresql://", "postgresql+psycopg://", 1)
    return normalized


DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = normalize_database_url(DATABASE_URL)
else:
    if os.getenv("VERCEL"):
        db_path = Path("/tmp/sukuupath.db")
    else:
        db_path = BASE_DIR / "sukuupath.db"
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path.as_posix()}"

engine_kwargs = {
    "pool_pre_ping": True,
}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
