from typing import TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
import enum
from apps.common.models import BaseDatabaseModel

if TYPE_CHECKING:
    from apps.user.models import User
    from apps.product.models import Category


class BulkRequestStatus(enum.Enum):
    OPEN = "open"  # Accepting pledges
    PARTIALLY_FILLED = "partially_filled"  # Some pledges accepted
    FULLY_FILLED = "fully_filled"  # All quantity pledged
    CLOSED = "closed"  # Manually closed by buyer
    EXPIRED = "expired"  # Past deadline


class PledgeStatus(enum.Enum):
    PENDING = "pending"  # Waiting for buyer approval
    ACCEPTED = "accepted"  # Buyer accepted the pledge
    REJECTED = "rejected"  # Buyer rejected the pledge
    FULFILLED = "fulfilled"  # Farmer delivered the goods
    CANCELLED = "cancelled"  # Farmer cancelled their pledge


class BulkRequest(BaseDatabaseModel):
    __tablename__ = "bulk_request"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("category.id"), nullable=True
    )
    quantity_needed: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # "kg", "tons", "pieces"
    max_price_per_unit: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_budget: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    delivery_deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    delivery_location: Mapped[str] = mapped_column(String(500), nullable=False)
    delivery_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[BulkRequestStatus] = mapped_column(
        Enum(BulkRequestStatus), default=BulkRequestStatus.OPEN, nullable=False
    )
    quantity_pledged: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    buyer: Mapped["User"] = relationship("User", back_populates="bulk_requests")
    pledges: Mapped[List["BulkRequestPledge"]] = relationship(
        "BulkRequestPledge", back_populates="bulk_request", cascade="all, delete-orphan"
    )
    category: Mapped[Optional["Category"]] = relationship(
        "Category", back_populates="bulk_requests"
    )

    @property
    def quantity_remaining(self) -> float:
        """Calculate remaining quantity needed"""
        return max(0.0, self.quantity_needed - self.quantity_pledged)

    @property
    def is_fully_pledged(self) -> bool:
        """Check if request is fully pledged"""
        return self.quantity_pledged >= self.quantity_needed


class BulkRequestPledge(BaseDatabaseModel):
    __tablename__ = "bulk_request_pledge"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quantity_pledged: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_delivery_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    delivery_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[PledgeStatus] = mapped_column(
        Enum(PledgeStatus), default=PledgeStatus.PENDING, nullable=False
    )
    bulk_request_id: Mapped[int] = mapped_column(
        ForeignKey("bulk_request.id"), nullable=False
    )
    farmer_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    bulk_request: Mapped["BulkRequest"] = relationship(
        "BulkRequest", back_populates="pledges"
    )
    farmer: Mapped["User"] = relationship("User", back_populates="pledges")

    @property
    def total_amount(self) -> float:
        """Calculate total amount for this pledge"""
        return self.quantity_pledged * self.price_per_unit
