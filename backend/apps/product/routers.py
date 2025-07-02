from fastapi import APIRouter, Request
from fastapi import HTTPException
from fastapi import Depends
from apps.product.schemas import ProductListQueryParams, ProductCreate, ProductUpdate
from apps.common.database import get_db
from apps.product.views import (
    get_all_product_view,
    create_product_view,
    delete_product_view,
    update_product_view,
)
from apps.common.custom_response import CustomJSONResponse

router = APIRouter(
    prefix="/product",
    tags=["product"],
    responses={404: {"description": "Not found"}},
)


@router.get("")
def get_all_product_route(
    request: Request,
    query_params: ProductListQueryParams = Depends(),
    db=Depends(get_db),
) -> CustomJSONResponse:
    """
    Get all products with optional query parameters for filtering, sorting, and pagination.
    """
    try:
        data = get_all_product_view(query_params, db)
        print(f"Products fetched: {data}")
        return CustomJSONResponse(
            content={"products": data}, message="Product List", status_code=200
        )
    except Exception as e:
        print(f"Error in get_all_product_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
def create_product_route(product: ProductCreate, db=Depends(get_db)):
    """
    Create a new product.
    """
    try:
        new_product = create_product_view(product, db)
        if not new_product:
            raise HTTPException(status_code=500, detail="Product creation failed")
        return CustomJSONResponse(
            content={"product": new_product},
            message="Product created successfully",
            status_code=201,
        )
    except Exception as e:
        print(f"Error in create_product_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{product_id}")
def delete_product_route(product_id: int, db=Depends(get_db)):
    """
    Delete a product.
    """
    print("DELETE IS CALLED")
    try:
        delete_return = delete_product_view(product_id, db)

        return delete_return
    except Exception as e:
        print(f"Error in create_product_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Update Product Route
@router.patch("/{product_id}")
def update_product_route(product_id: int, product: ProductUpdate, db=Depends(get_db)):
    """
    Update a product.
    """
    try:
        print("IN UPDATE PRODUCT ROUTE")
        updated_product = update_product_view(product_id, product, db)
        if not updated_product:
            raise HTTPException(
                status_code=404, detail=f"Product with id: {product_id} not found"
            )
        return updated_product
    except Exception as e:
        print(f"Error in update_product_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
