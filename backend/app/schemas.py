from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    name: str
    company: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    name: str | None = None
    company: str | None = None
    email: EmailStr

class OutcomeUpdate(BaseModel):
    offered_index: int | None = None
    outcome: str | None = None

class PredictRequest(BaseModel):
    customer_name: str | None = None
    tenure: int
    MonthlyCharges: float
    TotalCharges: float
    gender: str
    Partner: str
    Dependents: str
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str

class RiskCategory(BaseModel):
    id: int
    label: str
    detail: str
    color: str
    score: str
    action: str

class PredictResponse(BaseModel):
    prediction_id: int | None = None
    churn: int
    churn_label: str
    probability: float
    risk_category: RiskCategory
