from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from jose import JWTError, jwt
from apps.user.models import User
from apps.user.schemas import CreateUser
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
        updated_at=datetime.now(timezone.utc)
    )
    db.add(db_user)
    db.commit()
    return True
