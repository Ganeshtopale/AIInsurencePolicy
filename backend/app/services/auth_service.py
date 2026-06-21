import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

from app.config import settings

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password cannot be empty")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError) as e:
        logger.error("Password verification error: %s", e)
        return False


def create_access_token(
    user_id: int,
    email: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    if expires_delta is None:
        expires_delta = timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + expires_delta,
        "type": "access",
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token


def create_refresh_token(
    user_id: int,
    email: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    if expires_delta is None:
        expires_delta = timedelta(days=7)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + expires_delta,
        "type": "refresh",
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token


def create_tokens(user_id: int, email: str) -> dict:
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id, email)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def verify_token(token: str) -> Optional[dict]:
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid token: %s", e)
        return None


def authenticate_user(db_user, password: str) -> Optional[dict]:
    if db_user is None:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return create_tokens(db_user.id, db_user.email)


def refresh_access_token(refresh_token: str) -> Optional[dict]:
    payload = verify_token(refresh_token)
    if payload is None:
        return None
    if payload.get("type") != "refresh":
        logger.warning("Token is not a refresh token")
        return None
    user_id = int(payload["sub"])
    email = payload.get("email", "")
    return create_tokens(user_id, email)
