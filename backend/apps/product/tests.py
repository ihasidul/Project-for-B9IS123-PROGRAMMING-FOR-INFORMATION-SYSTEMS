import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timezone

from main import app
from apps.common.database import get_db, Base
from apps.product.models import Product, Category
from apps.user.models import User, UserTypeEnum
from config import PWD_CONTEXT

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_products.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override the dependency
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    """Set up test database."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def test_category(setup_database):
    """Create a test category."""
    db = TestingSessionLocal()
    try:
        # Check if category already exists
        existing_category = (
            db.query(Category).filter(Category.name == "Test Vegetables").first()
        )
        if existing_category:
            return existing_category

        category = Category(
            name="Test Vegetables", description="Test category for vegetables"
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    finally:
        db.close()


@pytest.fixture(scope="module")
def test_user(setup_database):
    """Create a test user."""
    db = TestingSessionLocal()
    try:
        # Check if user already exists
        existing_user = (
            db.query(User).filter(User.email == "testfarmer@example.com").first()
        )
        if existing_user:
            return existing_user

        hashed_password = PWD_CONTEXT.hash("testpassword123")
        user = User(
            username="testfarmer",
            email="testfarmer@example.com",
            hashed_password=hashed_password,
            user_type=UserTypeEnum.seller,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


@pytest.fixture
def test_products(setup_database, test_category, test_user):
    """Create test products with different prices and names for sorting tests."""
    db = TestingSessionLocal()
    try:
        products_data = [
            {"name": "Apples", "price": 5.99, "description": "Fresh red apples"},
            {"name": "Bananas", "price": 2.99, "description": "Yellow bananas"},
            {"name": "Carrots", "price": 3.49, "description": "Orange carrots"},
            {"name": "Dates", "price": 8.99, "description": "Sweet dates"},
            {"name": "Eggplant", "price": 4.99, "description": "Purple eggplant"},
        ]

        products = []
        for i, product_data in enumerate(products_data):
            product = Product(
                name=product_data["name"],
                price=product_data["price"],
                description=product_data["description"],
                category_id=test_category.id,
                product_owner_id=test_user.id,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(product)
            products.append(product)

        db.commit()
        for product in products:
            db.refresh(product)
        return products
    finally:
        db.close()


class TestProductAPI:
    """Test product API endpoints."""

    pass


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
