from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from app.config import DATABASE_URL

is_sqlite = DATABASE_URL.startswith("sqlite")
if is_sqlite:
    connect_args = {"check_same_thread": False}
else:
    # Aiven MySQL needs SSL without verification (same as cfa project)
    connect_args = {"ssl": {"verify_mode": False, "check_hostname": False}, "connect_timeout": 15}

engine_kwargs = {"connect_args": connect_args, "pool_pre_ping": True}
if not is_sqlite:
    engine_kwargs["pool_recycle"] = 3600

# strip ?ssl_ca=... from URL if present
clean_url = DATABASE_URL.split("?", 1)[0]
engine = create_engine(clean_url, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    tenure = Column(Integer, nullable=False)
    monthly_charges = Column(Float, nullable=False)
    total_charges = Column(Float, nullable=False)
    contract = Column(String(50))
    internet_service = Column(String(50))
    payment_method = Column(String(100))
    churn = Column(Integer, nullable=False)
    churn_label = Column(String(10))
    probability = Column(Float, nullable=False)
    offers = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# MySQL needs explicit create after all models defined (with retry for Aiven cold start)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"DB init warning: {e} - will retry on first request")
    if is_sqlite:
        raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
