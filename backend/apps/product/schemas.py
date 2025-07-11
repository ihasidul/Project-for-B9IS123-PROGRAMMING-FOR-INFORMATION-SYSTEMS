from typing import Annotated, Optional, Literal
from pydantic import BaseModel, conint


class ProductListQueryParams(BaseModel):
    page: Annotated[int, conint(gt=0)] = 1
    limit: Annotated[int, conint(gt=0)] = 10
    search: str | None = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sort_by: Optional[Literal["name", "price", "created_at", "updated_at"]] = "name"
    sort_order: Optional[Literal["asc", "desc"]] = "asc"


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    photo_url: str | None = None
    category_id: int | None = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    photo_url: Optional[str] = None
    category_id: Optional[int] = None
