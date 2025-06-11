from fastapi.encoders import jsonable_encoder

from apps.product.db import get_all_products


def get_all_product_view(query_params, db)-> list:
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