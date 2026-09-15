import os
from pathlib import Path
from dotenv import load_dotenv

# Load env: .env.production if ENV=production else .env (local)
env = os.getenv("ENV", "local")
base = Path(__file__).resolve().parents[1]
if env == "production" and (base / ".env.production").exists():
    load_dotenv(base / ".env.production")
else:
    load_dotenv(base / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
