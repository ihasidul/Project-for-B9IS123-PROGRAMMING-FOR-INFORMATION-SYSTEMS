from typing import Annotated
from pydantic import BaseModel, conint


class ProductListQueryParams(BaseModel):
    page: Annotated[int, conint(gt=0)] = 1
    limit: Annotated[int, conint(gt=0)] = 10
    search: str | None = None
