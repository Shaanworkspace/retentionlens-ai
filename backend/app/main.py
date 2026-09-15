from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.predict import router as predict_router
from app.routers.offers import router as offers_router

app = FastAPI(title="Churn Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(offers_router)

@app.get("/")
def root():
    return {"message": "Churn Prediction API is running"}
