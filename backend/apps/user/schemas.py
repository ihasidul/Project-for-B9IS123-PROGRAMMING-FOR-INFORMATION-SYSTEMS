from typing import Annotated
from pydantic import BaseModel, conint
from apps.user.models import UserTypeEnum


class CreateUser(BaseModel):
    username: str
    email: str
    password: str
    user_type: UserTypeEnum

