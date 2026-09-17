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
    # Identity only - never used by the model
    customer_name: str | None = None
    # MANDATORY: top churn drivers (Contract, tenure, charges, fiber, payment).
    # Missing any of these -> 422, prediction cannot run.
    tenure: int
    MonthlyCharges: float
    TotalCharges: float
    Contract: str
    InternetService: str
    PaymentMethod: str
    # OPTIONAL: safe dataset-mode defaults applied when skipped.
    # gender/Partner/Dependents are weak signals; service flags default to "No".
    gender: str | None = None
    Partner: str | None = None
    Dependents: str | None = None
    PhoneService: str | None = None
    MultipleLines: str | None = None
    OnlineSecurity: str | None = None
    OnlineBackup: str | None = None
    DeviceProtection: str | None = None
    TechSupport: str | None = None
    StreamingTV: str | None = None
    StreamingMovies: str | None = None
    PaperlessBilling: str | None = None

MANDATORY_FIELDS = ["tenure", "MonthlyCharges", "TotalCharges", "Contract", "InternetService", "PaymentMethod"]

OPTIONAL_DEFAULTS = {
    "gender": "Male",
    "Partner": "No",
    "Dependents": "No",
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "PaperlessBilling": "Yes",
}

def fill_defaults(data: dict) -> dict:
    filled = dict(data)
    for field, default in OPTIONAL_DEFAULTS.items():
        if filled.get(field) is None or (isinstance(filled.get(field), str) and not filled[field].strip()):
            filled[field] = default
    return filled

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
