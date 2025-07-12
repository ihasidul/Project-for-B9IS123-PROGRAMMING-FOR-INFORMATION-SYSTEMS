from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from apps.product.services import (
    get_all_products,
    create_product,
    delete_product,
    update_product,
    get_all_product_categories,
    product_exists_for_user,
)
from apps.product.schemas import ProductCreate, ProductListQueryParams, ProductUpdate
from apps.common.custom_response import CustomJSONResponse


def get_user_products_view(
    db: Session, user_id: int, user_type: str, query_params: ProductListQueryParams
) -> CustomJSONResponse:
    """
    Get all products for the authenticated user.
    Return JSON-serializable list of products.
    """
    try:
        products = get_all_products(
            db_session=db,
            page=query_params.page,
            limit=query_params.limit,
            search=query_params.search,
            category_id=query_params.category_id,
            is_active=query_params.is_active,
            min_price=query_params.min_price,
            max_price=query_params.max_price,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order,
            user_id=user_id,
        )
        print(f"Fetched {len(products)} products from the database.")
        if not products:
            print("No products found.")
            return CustomJSONResponse(
                content={},
                message="No products found.",
                status_code=200,
            )
        serialized_products = [
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "photo_url": product.photo_url,
                "is_active": bool(product.is_active),
                "category": product.category.name if product.category else None,
                "category_id": product.category_id,
                "created_at": product.created_at.isoformat()
                if product.created_at
                else None,
                "updated_at": product.updated_at.isoformat()
                if product.updated_at
                else None,
            }
            for product in products
        ]

        print(f"Products fetched: {products}")
        return CustomJSONResponse(
            content={"products": jsonable_encoder(serialized_products)},
            message="User Products",
            status_code=200,
        )
    except Exception as e:
        print(f"Error in get_user_products_view: {str(e)}")
        raise Exception(f"Error in get_user_products_view: {str(e)}")


def get_all_product_view(query_params: ProductListQueryParams, db: Session) -> list:
    """
    Get all products with optional query parameters for filtering, sorting, and pagination.
    Return JSON-serializable list of products.
    """
    try:
        products = get_all_products(
            db_session=db,
            page=query_params.page,
            limit=query_params.limit,
            search=query_params.search,
            category_id=query_params.category_id,
            is_active=query_params.is_active,
            min_price=query_params.min_price,
            max_price=query_params.max_price,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order,
        )
        print(f"Fetched {len(products)} products from the database.")
        if not products:
            print("No products found.")
            return []
        serialized_products = [
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "photo_url": product.photo_url,
                "is_active": bool(product.is_active),
                "category": product.category.name if product.category else None,
                "category_id": product.category_id,
                "created_at": product.created_at.isoformat()
                if product.created_at
                else None,
                "updated_at": product.updated_at.isoformat()
                if product.updated_at
                else None,
            }
            for product in products
        ]

        print(f"Products fetched: {products}")
        return jsonable_encoder(serialized_products)
    except Exception as e:
        print(f"Error in get_all_product_view: {str(e)}")
        raise Exception(f"Error in get_all_product_view: {str(e)}")


def create_product_view(
    product: ProductCreate, db: Session, product_owner_id: int
) -> CustomJSONResponse:
    """
    Create a new product.
    """
    try:
        # If Product with same name already exists for same owner return already exists
        existing_product = product_exists_for_user(
            db_session=db,
            product_name=product.name,
            user_id=product_owner_id,
        )
        if existing_product:
            return CustomJSONResponse(
                content={},
                message="Product with same name already exists",
                status_code=400,
            )
        product_data = product.model_dump(by_alias=True)
        product_data["product_owner_id"] = product_owner_id
        print(f"Creating product with data: {product_data}")
        new_product = create_product(db, product_data)
        product = jsonable_encoder(new_product)
        return CustomJSONResponse(
            content={"product": product},
            message="Product created successfully",
            status_code=201,
        )
    except Exception as e:
        print(f"Error in create_product_view: {str(e)}")
        raise Exception(f"Error in create_product_view: {str(e)}")


def delete_product_view(
    product_id: int, user_id: int, db: Session
) -> CustomJSONResponse:
    """
    Delete a product by its ID.
    """
    try:
        print(f"Deleting product with ID: {product_id}")
        is_deleted = delete_product(
            product_id=product_id, user_id=user_id, db_session=db
        )
        if is_deleted:
            print(f"Product with ID {product_id} deleted successfully.")
            return CustomJSONResponse(
                content={},
                message=f"Product with ID {product_id} deleted successfully.",
                status_code=200,
            )
        else:
            print(f"Product with ID {product_id} not found.")
            return CustomJSONResponse(
                content={},
                message=f"Product with ID {product_id} not found.",
                status_code=404,
            )
    except Exception as e:
        print(f"Error in delete_product_view: {str(e)}")
        raise Exception(f"Error in delete_product_view: {str(e)}")


def update_product_view(
    user_id: int, product_id: int, product_data: ProductUpdate, db: Session
) -> CustomJSONResponse:
    """
    Update a product by its ID and user ID.
    """
    try:
        print(f"Updating product with ID: {product_id} with data: {product_data}")
        updated_product = update_product(
            db_session=db,
            product_id=product_id,
            product_data=product_data.model_dump(
                by_alias=True, exclude_unset=True, exclude_none=True
            ),
            user_id=user_id,
        )
        if not updated_product:
            return CustomJSONResponse(
                content={},
                message=f"Product with ID {product_id} not found.",
                status_code=404,
            )

        print(f"Product with ID {product_id} updated successfully.")
        data = {"product": jsonable_encoder(updated_product)}
        return CustomJSONResponse(
            content=data,
            message=f"Product with ID {product_id} updated successfully.",
            status_code=200,
        )
    except Exception as e:
        print(f"Error in update_product_view: {str(e)}")
        raise Exception(f"Error in update_product_view: {str(e)}")


def get_all_product_categories_view(db: Session) -> CustomJSONResponse:
    """
    Get all categories.
    """
    try:
        data = get_all_product_categories(db_session=db)
        if not data:
            print("No categories found.")
            return CustomJSONResponse(
                content={},
                message="No categories found.",
                status_code=404,
            )
        serialized_categories = [
            {
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "is_active": category.is_active,
            }
            for category in data
        ]
        return CustomJSONResponse(
            content={"categories": jsonable_encoder(serialized_categories)},
            message="Product Categories List",
            status_code=200,
        )
    except Exception as e:
        print(f"Error in get_all_product_category_view: {str(e)}")
        raise Exception(f"Error in get_all_product_category_view: {str(e)}")
