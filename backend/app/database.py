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
    name = Column(String(120), nullable=True)
    company = Column(String(160), nullable=True)
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
    customer_name = Column(String(120), nullable=True)
    offered_index = Column(Integer, nullable=True)
    outcome = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# MySQL needs explicit create after all models defined (with retry for Aiven cold start)
try:
    Base.metadata.create_all(bind=engine)
    # lightweight migration for columns added after first release
    from sqlalchemy import inspect as _inspect, text as _text
    with engine.begin() as _conn:
        _user_cols = {c["name"] for c in _inspect(engine).get_columns("users")}
        if "name" not in _user_cols:
            _conn.execute(_text("ALTER TABLE users ADD COLUMN name VARCHAR(120)"))
        if "company" not in _user_cols:
            _conn.execute(_text("ALTER TABLE users ADD COLUMN company VARCHAR(160)"))
        try:
            _pred_cols = {c["name"] for c in _inspect(engine).get_columns("predictions")}
        except Exception:
            _pred_cols = set()
        if _pred_cols:
            if "customer_name" not in _pred_cols:
                _conn.execute(_text("ALTER TABLE predictions ADD COLUMN customer_name VARCHAR(120)"))
            if "offered_index" not in _pred_cols:
                _conn.execute(_text("ALTER TABLE predictions ADD COLUMN offered_index INTEGER"))
            if "outcome" not in _pred_cols:
                _conn.execute(_text("ALTER TABLE predictions ADD COLUMN outcome VARCHAR(20)"))
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
