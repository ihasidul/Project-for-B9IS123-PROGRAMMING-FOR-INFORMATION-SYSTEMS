from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from apps.common.models import BaseDatabaseModel


class Category(BaseDatabaseModel):
    __tablename__ = "category"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    products: Mapped[List["Product"]] = relationship(
        "Product", back_populates="category", cascade="all, delete-orphan"
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

    category: Mapped[Optional[Category]] = relationship(
        "Category", back_populates="products"
    )

    def __repr__(self):
        return f"<Product id={self.id} name={self.name} price={self.price}>"

    def __str__(self):
        return f"Product(id={self.id}, name={self.name}, price={self.price})"
