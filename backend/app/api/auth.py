from datetime import datetime, timedelta, timezone
from typing import Optional
import random
import string

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    username: Optional[str] = None


class UserLogin(BaseModel):
    email: Optional[str] = None
    password: str
    phone: Optional[str] = None
    username: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    username: Optional[str] = None
    phone: Optional[str] = None
    profile_pic: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    income: Optional[str] = None
    family_size: Optional[int] = None
    role: str = "customer"
    is_active: bool = True

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class GoogleLoginRequest(BaseModel):
    email: str
    name: str
    google_id: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    profile_pic: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    income: Optional[str] = None
    family_size: Optional[int] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=settings.JWT_EXPIRATION_HOURS))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != expected_type:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    from app.models.user import User

    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is disabled")
    return user


async def get_admin_user(current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def get_admin_or_agent(current_user=Depends(get_current_user)):
    if current_user.role not in ("admin", "agent"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or agent access required")
    return current_user


def _build_auth_response(user) -> AuthResponse:
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
    )


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    from app.models.user import User

    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if user_data.username:
        result = await db.execute(select(User).where(User.username == user_data.username))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    hashed = _hash_password(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed,
        name=user_data.name,
        phone=user_data.phone,
        username=user_data.username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return _build_auth_response(user)


@router.post("/admin-login", response_model=AuthResponse)
async def admin_login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    from app.models.user import User, UserRole

    username = credentials.username or ""
    password = credentials.password or ""

    # Hardcoded super admin check
    if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
        result = await db.execute(select(User).where(User.username == settings.ADMIN_USERNAME))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                name="Super Admin",
                email=settings.ADMIN_EMAIL,
                username=settings.ADMIN_USERNAME,
                hashed_password=_hash_password(settings.ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                phone=settings.ADMIN_MOBILE,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return _build_auth_response(user)

    # DB admin login (for admins created via Admin Dashboard)
    if not username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username required")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        result = await db.execute(select(User).where(User.email == username))
        user = result.scalar_one_or_none()
    if not user or not _verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not an admin account")

    return _build_auth_response(user)


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    from app.models.user import User

    filters = []
    if credentials.email:
        filters.append(User.email == credentials.email)
    if credentials.username:
        filters.append(User.username == credentials.username)
    if credentials.phone:
        filters.append(User.phone == credentials.phone)

    if not filters:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email, username, or phone required")

    result = await db.execute(select(User).where(or_(*filters)))
    user = result.scalar_one_or_none()
    if not user or not _verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return _build_auth_response(user)


@router.post("/google", response_model=AuthResponse)
async def google_login(body: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    from app.models.user import User

    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(email=body.email, name=body.name, hashed_password="", google_id=body.google_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return _build_auth_response(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(body: RefreshRequest):
    payload = verify_token(body.refresh_token, expected_type="refresh")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    access_token = create_access_token({"sub": user_id})
    new_refresh = create_refresh_token({"sub": user_id})
    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(body: ProfileUpdateRequest, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.user import User

    user = await db.get(User, current_user.id)
    if body.name is not None:
        user.name = body.name
    if body.username is not None:
        existing = await db.execute(select(User).where(User.username == body.username, User.id != current_user.id))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        user.username = body.username
    if body.phone is not None:
        user.phone = body.phone
    if body.profile_pic is not None:
        user.profile_pic = body.profile_pic
    if body.age is not None:
        user.age = body.age
    if body.city is not None:
        user.city = body.city
    if body.income is not None:
        user.income = body.income
    if body.family_size is not None:
        user.family_size = body.family_size
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/change-password")
async def change_password(body: ChangePasswordRequest, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.user import User

    user = await db.get(User, current_user.id)
    if not _verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    user.hashed_password = _hash_password(body.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    from app.models.user import User

    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        return {"message": "If email exists, OTP has been sent"}

    otp = _generate_otp()
    user.otp = otp
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.commit()

    print(f"[OTP for {body.email}]: {otp}")
    return {"message": "OTP sent to email"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    from app.models.user import User

    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not user.otp or user.otp != body.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")

    if not user.otp_expiry or datetime.now(timezone.utc) > user.otp_expiry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    user.hashed_password = _hash_password(body.new_password)
    user.otp = None
    user.otp_expiry = None
    await db.commit()
    return {"message": "Password reset successfully"}
