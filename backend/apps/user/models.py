from typing import TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Enum, DateTime 
from sqlalchemy.orm import declarative_base
import enum
from sqlalchemy.orm import Mapped, relationship
from apps.common.models import BaseDatabaseModel
from apps.product.models import Product
# https://docs.python.org/3/library/typing.html#typing.TYPE_CHECKING

from typing import List
if TYPE_CHECKING:
    from apps.product.models import Product

class UserTypeEnum(enum.Enum):
    business = "business"
    customer = "customer"
    seller = "seller"

class User(BaseDatabaseModel):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    user_type = Column(Enum(UserTypeEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, 
                        default=datetime.now(timezone.utc),
                        onupdate=datetime.now(timezone.utc),
                        nullable=False)
    products: Mapped[List["Product"]] = relationship("Product", back_populates="product_owner")