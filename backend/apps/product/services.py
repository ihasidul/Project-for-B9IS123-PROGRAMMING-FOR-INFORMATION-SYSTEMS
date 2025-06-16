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
