from typing import Annotated, Optional, Literal
from pydantic import BaseModel, conint, Field
from datetime import datetime


class BulkRequestListQueryParams(BaseModel):
    page: Annotated[int, conint(gt=0)] = 1
    limit: Annotated[int, conint(gt=0)] = 10
    search: str | None = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    min_quantity: Optional[float] = None
    max_quantity: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sort_by: Optional[
        Literal["title", "quantity_needed", "delivery_deadline", "created_at"]
    ] = "created_at"
    sort_order: Optional[Literal["asc", "desc"]] = "desc"


class BulkRequestCreate(BaseModel):
    title: str = Field(
        ..., min_length=1, max_length=255, description="Title of the bulk request"
    )
    description: str | None = Field(
        None, description="Detailed description of the request"
    )
    product_name: str = Field(
        ..., min_length=1, max_length=255, description="Name of the product needed"
    )
    category_id: int | None = Field(None, description="Category ID for the product")
    quantity_needed: float = Field(..., gt=0, description="Total quantity needed")
    unit: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unit of measurement (kg, tons, pieces, etc.)",
    )
    max_price_per_unit: float | None = Field(
        None, gt=0, description="Maximum price willing to pay per unit"
    )
    total_budget: float | None = Field(
        None, gt=0, description="Total budget for the request"
    )
    delivery_deadline: datetime = Field(..., description="Deadline for delivery")
    delivery_location: str = Field(
        ..., min_length=1, max_length=500, description="Delivery location"
    )
    delivery_instructions: str | None = Field(
        None, description="Special delivery instructions"
    )
