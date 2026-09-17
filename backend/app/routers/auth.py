from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, User
from app.schemas import SignupRequest, LoginRequest, TokenResponse, UserOut
from app.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if not payload.name.strip() or not payload.company.strip():
        raise HTTPException(status_code=400, detail="Name and company are required")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=payload.name.strip(), company=payload.company.strip(), email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    token = create_token({"sub": payload.email})
    return {"access_token": token}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_token({"sub": payload.email})
    return {"access_token": token}

@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return {"name": user.name, "company": user.company, "email": user.email}
