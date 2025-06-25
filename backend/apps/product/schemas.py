from typing import Annotated
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
    name: str | None = None
    description: str | None = None
    price: float | None = None
    photo_url: str | None = None
    category_id: int | None = None

