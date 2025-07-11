from typing import Annotated, Optional
from pydantic import BaseModel, conint
from apps.user.models import UserTypeEnum


class CreateUser(BaseModel):
    username: str
    email: str
    password: str
    user_type: UserTypeEnum


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: int
    username: str
    user_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
    user_type: Optional[str] = None
