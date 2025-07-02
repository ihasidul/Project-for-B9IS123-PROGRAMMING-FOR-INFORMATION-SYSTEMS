from typing import Annotated, Optional
from pydantic import BaseModel, conint


class ProductListQueryParams(BaseModel):
    page: Annotated[int, conint(gt=0)] = 1
    limit: Annotated[int, conint(gt=0)] = 10
    search: str | None = None


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
