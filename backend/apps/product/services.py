from sqlalchemy import select
from sqlalchemy.orm import Session
from apps.product.models import Product

def get_all_products(db_session: Session, page: int = 1, limit: int = 10):
    """
    Fetch products from the sqlite db using SQLAlchemy ORM (sync) with pagination.
    """
    try:
        offset = (page - 1) * limit
        stmt = select(Product).offset(offset).limit(limit)
        result = db_session.execute(stmt)
        products = result.scalars().all()
        return products
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        raise Exception(f"Error fetching products: {str(e)}")

def create_product(db_session: Session, product_data: dict):
    """
    Create a new product in the sqlite db using SQLAlchemy ORM (sync).
    """
    try:
    
        new_product = Product(**product_data)
        db_session.add(new_product)
        db_session.commit()
        db_session.refresh(new_product)
        return new_product
    except Exception as e:
        print(f"Error creating product: {str(e)}")
        raise Exception(f"Error creating product: {str(e)}")
    

def delete_product(db_session: Session, product_id: int) -> bool:
    """
    Delete a product by its ID from the sqlite db using SQLAlchemy ORM (sync).
    """
    try:
        product = db_session.query(Product).filter(Product.id == product_id).first()
        print(f"The Product: {product}")
        
        if not product:
            print(f"Product with ID {product_id} not found.")
            return False
        
        db_session.delete(product)
        db_session.commit()
        print(f"Product with ID {product_id} deleted successfully.")
        return True
    except Exception as e:
        print(f"Error deleting product: {str(e)}")
        raise Exception(f"Error deleting product: {str(e)}")
        return False