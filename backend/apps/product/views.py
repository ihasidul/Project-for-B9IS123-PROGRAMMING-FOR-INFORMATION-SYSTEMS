from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from apps.product.services import get_all_products, create_product
from apps.product.schemas import ProductCreate, ProductListQueryParams


def get_all_product_view(query_params: ProductListQueryParams, db: Session)-> list:
    """
    Get all products with optional query parameters for filtering, sorting, and pagination.
    Return JSON-serializable list of products.
    """
    try:
        products = get_all_products(
            db_session=db,
            page=query_params.page,
            limit=query_params.limit,
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
            }
            for product in products
        ]

        print(f"Products fetched: {products}")
        return jsonable_encoder(serialized_products)
    except Exception as e:
        print(f"Error in get_all_product_view: {str(e)}")
        raise Exception(f"Error in get_all_product_view: {str(e)}")
    

def create_product_view(product:ProductCreate , db: Session) -> dict:
    """
    Create a new product.
    """
    try:
        # TODO:
        # FOR NOW HARD CODING product_owner_id. REMOVE LATER
        product_owner_id = 1
        print(f"BEFORe: {product}")
        product_data = product.model_dump(by_alias=True)
        print(f"Creating product with data: {product_data}")
        product_data['product_owner_id'] = product_owner_id  # Add product owner ID
        new_product = create_product(db, product_data)
        if not new_product:
            raise Exception("Product creation failed")
        
        print(f"Product created successfully: {new_product}")
        return jsonable_encoder(new_product)
    except Exception as e:
        print(f"Error in create_product_view: {str(e)}")
        raise Exception(f"Error in create_product_view: {str(e)}")