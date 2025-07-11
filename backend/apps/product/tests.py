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

    def test_get_products_basic(self, test_products):
        """Test basic product listing."""
        response = client.get("/api/product")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "products" in data["data"]
        assert len(data["data"]["products"]) > 0

        # Check that timestamp fields are included
        product = data["data"]["products"][0]
        assert "created_at" in product
        assert "updated_at" in product
        assert product["created_at"] is not None
        assert product["updated_at"] is not None

    def test_get_products_pagination(self, test_products):
        """Test product pagination."""
        # Test first page
        response = client.get("/api/product?page=1&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]["products"]) == 2

        # Test second page
        response = client.get("/api/product?page=2&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]["products"]) <= 2

    def test_get_products_search(self, test_products):
        """Test product search functionality."""
        response = client.get("/api/product?search=apple")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # Should find products containing "apple" (case insensitive)
        assert len(products) > 0
        assert any("apple" in product["name"].lower() for product in products)

    def test_get_products_category_filter(self, test_products, test_category):
        """Test product filtering by category."""
        response = client.get(f"/api/product?category_id={test_category.id}")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # All products should belong to the test category
        for product in products:
            assert product["category_id"] == test_category.id

    def test_get_products_price_filter(self, test_products):
        """Test product filtering by price range."""
        response = client.get("/api/product?min_price=3&max_price=6")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # All products should be within price range
        for product in products:
            assert 3 <= product["price"] <= 6

    def test_get_products_sort_by_name_asc(self, test_products):
        """Test sorting products by name (ascending)."""
        response = client.get("/api/product?sort_by=name&sort_order=asc")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # Check if products are sorted by name (A-Z)
        names = [product["name"] for product in products]
        assert names == sorted(names)

    def test_get_products_sort_by_name_desc(self, test_products):
        """Test sorting products by name (descending)."""
        response = client.get("/api/product?sort_by=name&sort_order=desc")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # Check if products are sorted by name (Z-A)
        names = [product["name"] for product in products]
        assert names == sorted(names, reverse=True)

    def test_get_products_sort_by_price_asc(self, test_products):
        """Test sorting products by price (ascending)."""
        response = client.get("/api/product?sort_by=price&sort_order=asc")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # Check if products are sorted by price (low to high)
        prices = [product["price"] for product in products]
        assert prices == sorted(prices)

    def test_get_products_sort_by_price_desc(self, test_products):
        """Test sorting products by price (descending)."""
        response = client.get("/api/product?sort_by=price&sort_order=desc")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # Check if products are sorted by price (high to low)
        prices = [product["price"] for product in products]
        assert prices == sorted(prices, reverse=True)

    def test_get_products_sort_by_created_at(self, test_products):
        """Test sorting products by creation date."""
        response = client.get("/api/product?sort_by=created_at&sort_order=desc")

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # Check that created_at field is present and not None
        for product in products:
            assert "created_at" in product
            assert product["created_at"] is not None

    def test_get_products_invalid_sort_field(self, test_products):
        """Test handling of invalid sort field."""
        response = client.get("/api/product?sort_by=invalid_field&sort_order=asc")

        # Should return 422 for invalid sort field (validation error)
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_get_products_combined_filters(self, test_products, test_category):
        """Test combining multiple filters and sorting."""
        response = client.get(
            f"/api/product?category_id={test_category.id}&min_price=2&max_price=10&sort_by=price&sort_order=asc&search=a"
        )

        assert response.status_code == 200
        data = response.json()
        products = data["data"]["products"]

        # Check that all filters are applied
        for product in products:
            assert product["category_id"] == test_category.id
            assert 2 <= product["price"] <= 10
            assert (
                "a" in product["name"].lower() or "a" in product["description"].lower()
            )


class TestProductCategories:
    """Test product category endpoints."""

    def test_get_categories(self, test_category):
        """Test getting product categories."""
        response = client.get("/api/product/category")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "categories" in data["data"]
        assert len(data["data"]["categories"]) > 0

        # Check category structure
        category = data["data"]["categories"][0]
        assert "id" in category
        assert "name" in category
        assert "description" in category


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
