from fastapi import APIRouter, Request
from fastapi import HTTPException
from fastapi import Depends
from apps.product.schemas import ProductListQueryParams, ProductCreate, ProductUpdate
from apps.user.models import UserTypeEnum
from apps.common.database import get_db
from apps.product.views import (
    get_all_product_view,
    create_product_view,
    delete_product_view,
    update_product_view,
    get_all_product_categories_view,
    get_user_products_view,
)
from apps.common.custom_response import CustomJSONResponse
from apps.common.auth import is_authenticated

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
def create_product_route(
    request: Request,
    product: ProductCreate,
    db=Depends(get_db),
    is_authenticated=Depends(is_authenticated),
):
    """
    Create a new product.
    """
    try:
        user_id = request.state.user_id
        response = create_product_view(product=product, db=db, product_owner_id=user_id)
        return response

    except Exception as e:
        print(f"Error in create_product_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{product_id}")
def delete_product_route(
    request: Request,
    product_id: int,
    db=Depends(get_db),
    is_authenticated=Depends(is_authenticated),
):
    """
    Delete a product.
    """
    print("DELETE IS CALLED")
    try:
        user_id = request.state.user_id
        delete_return = delete_product_view(
            product_id=product_id, user_id=user_id, db=db
        )
        return delete_return
    except Exception as e:
        print(f"Error in create_product_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Update Product Route
@router.patch("/{product_id}")
def update_product_route(
    request: Request,
    product_id: int,
    product: ProductUpdate,
    db=Depends(get_db),
    is_authenticated=Depends(is_authenticated),
):
    """
    Update a product.
    """
    try:
        print("IN UPDATE PRODUCT ROUTE")
        user_id = request.state.user_id
        updated_product = update_product_view(
            user_id=user_id, product_id=product_id, product_data=product, db=db
        )
        if not updated_product:
            raise HTTPException(
                status_code=404, detail=f"Product with id: {product_id} not found"
            )
        return updated_product
    except Exception as e:
        print(f"Error in update_product_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/category")
def get_all_product_categories_route(
    request: Request,
    db=Depends(get_db),
) -> CustomJSONResponse:
    """
    Get all product Category.
    """
    try:
        response = get_all_product_categories_view(db)
        return response

    except Exception as e:
        print(f"Error in get_all_product_category_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-products")
def get_user_products_route(
    request: Request,
    query_params: ProductListQueryParams = Depends(),
    db=Depends(get_db),
    is_authenticated=Depends(is_authenticated),
) -> CustomJSONResponse:
    """
    Get all products for the authenticated user.
    """
    try:
        user_id = request.state.user_id
        user_type = request.state.user_type
        if user_type == UserTypeEnum.seller.value:
            response = get_user_products_view(db, user_id, user_type, query_params)
        else:
            raise HTTPException(
                status_code=403, detail="You are not authorized to view this resource"
            )
        return response
    except Exception as e:
        print(f"Error in get_user_products_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
