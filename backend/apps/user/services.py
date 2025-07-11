from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi import HTTPException, status
from apps.user.models import User
from apps.user.schemas import CreateUser, TokenData
from config import PWD_CONTEXT, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, user: CreateUser):
    hashed_password = PWD_CONTEXT.hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        user_type=user.user_type,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(db_user)
    db.commit()
    return True


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate user with username and password.
    Returns User object if authentication successful, None otherwise.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None

    if not PWD_CONTEXT.verify(password, user.hashed_password):
        return None

    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token with user data.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> TokenData:
    """
    Verify JWT token and extract user data.
    Raises HTTPException if token is invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        username: str = payload.get("username")
        user_type: str = payload.get("user_type")

        if user_id is None or username is None:
            raise credentials_exception

        token_data = TokenData(user_id=user_id, username=username, user_type=user_type)
        return token_data

    except JWTError:
        raise credentials_exception


def get_current_user(db: Session, token: str) -> User:
    """
    Get current user from JWT token.
    """
    token_data = verify_token(token)
    user = db.query(User).filter(User.id == token_data.user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
