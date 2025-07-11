from typing import Union, Optional
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from apps.product.models import Product, Category


def get_all_products(
    db_session: Session,
    page: int = 1,
    limit: int = 10,
    search: Union[str, None] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    """
    Fetch products from the sqlite db using SQLAlchemy ORM (sync) with pagination and filtering.
    """
    try:
        offset = (page - 1) * limit
        stmt = select(Product)
        if search:
            search_pattern = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(Product.name).like(search_pattern),
                    func.lower(Product.description).like(search_pattern),
                )
            )
        if category_id is not None:
            stmt = stmt.where(Product.category_id == category_id)
        if is_active is not None:
            stmt = stmt.where(Product.is_active == is_active)
        if min_price is not None:
            stmt = stmt.where(Product.price >= min_price)
        if max_price is not None:
            stmt = stmt.where(Product.price <= max_price)
        stmt = stmt.offset(offset).limit(limit)
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


def update_product(db_session: Session, product_id: int, product_data: dict) -> Product:
    """
    Update an existing product by its ID in the sqlite db using SQLAlchemy ORM (sync).
    """
    try:
        product = db_session.query(Product).filter(Product.id == product_id).first()
        print(f"The Product: {product}")

        if not product:
            print(f"Product with ID {product_id} not found.")
            raise Exception(f"Product with ID {product_id} not found.")

        for key, value in product_data.items():
            setattr(product, key, value)

        db_session.commit()
        db_session.refresh(product)
        print(f"Product with ID {product_id} updated successfully.")
        return product
    except Exception as e:
        print(f"Error updating product: {str(e)}")
        raise Exception(f"Error updating product: {str(e)}")


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


def get_all_product_categories(db_session: Session) -> list:
    """
    Fetch all categories from the sqlite db category table using SQLAlchemy ORM (sync).
    """
    try:
        stmt = select(Category)
        result = db_session.execute(stmt)
        categories = result.scalars().all()
        return categories
    except Exception as e:
        print(f"Error fetching product categories: {str(e)}")
        raise Exception(f"Error fetching product categories: {str(e)}")
