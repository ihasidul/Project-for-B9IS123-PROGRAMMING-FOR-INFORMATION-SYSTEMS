from typing import TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from apps.common.models import BaseDatabaseModel

if TYPE_CHECKING:
    from apps.user.models import User
    from apps.bulk_request.models import BulkRequest


class Category(BaseDatabaseModel):
    __tablename__ = "category"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    products: Mapped[List["Product"]] = relationship(
        "Product", back_populates="category", cascade="all, delete-orphan"
    )
    bulk_requests: Mapped[List["BulkRequest"]] = relationship(
        "BulkRequest", back_populates="category"
    )

    def __repr__(self):
        return f"<Category id={self.id} name={self.name}>"

    def __str__(self):
        return f"Category(id={self.id}, name={self.name})"


class Product(BaseDatabaseModel):
    __tablename__ = "product"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    photo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    category_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("category.id"), nullable=True
    )

    product_owner_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True,
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True,
    )

    product_owner: Mapped["User"] = relationship("User", back_populates="products")
    category: Mapped[Optional[Category]] = relationship(
        "Category", back_populates="products"
    )

    def __repr__(self):
        return f"<Product id={self.id} name={self.name} price={self.price}>"

    def __str__(self):
        return f"Product(id={self.id}, name={self.name}, price={self.price})"
