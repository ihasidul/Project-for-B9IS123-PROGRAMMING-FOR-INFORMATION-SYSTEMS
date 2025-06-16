from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()

class UserTypeEnum(enum.Enum):
    business = "business"
    customer = "customer"
    seller = "seller"

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    user_type = Column(Enum(UserTypeEnum), nullable=False)