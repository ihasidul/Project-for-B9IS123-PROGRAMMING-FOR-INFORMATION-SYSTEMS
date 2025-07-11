import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from apps.common.database import get_db, Base
from apps.user.models import User, UserTypeEnum
from config import PWD_CONTEXT

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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


@pytest.fixture
def test_user_data():
    """Test user data fixture."""
    return {
        "username": "testfarmer",
        "email": "testfarmer@example.com",
        "password": "testpassword123",
        "user_type": "seller"
    }


@pytest.fixture
def create_test_user(setup_database, test_user_data):
    """Create a test user in the database."""
    db = TestingSessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == test_user_data["username"]).first()
        if existing_user:
            db.delete(existing_user)
            db.commit()
        
        # Create new test user
        hashed_password = PWD_CONTEXT.hash(test_user_data["password"])
        test_user = User(
            username=test_user_data["username"],
            email=test_user_data["email"],
            hashed_password=hashed_password,
            user_type=UserTypeEnum.seller
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        return test_user
    finally:
        db.close()


class TestUserRegistration:
    """Test user registration functionality."""
    
    def test_register_user_success(self, setup_database):
        """Test successful user registration."""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123",
            "user_type": "customer"
        }
        
        response = client.post("/api/user/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert data["data"]["user"]["username"] == user_data["username"]
        assert data["data"]["user"]["email"] == user_data["email"]
    
    def test_register_user_duplicate_username(self, create_test_user):
        """Test registration with duplicate username."""
        user_data = {
            "username": "testfarmer",  # Same as test user
            "email": "different@example.com",
            "password": "password123",
            "user_type": "customer"
        }
        
        response = client.post("/api/user/register", json=user_data)
        
        assert response.status_code == 400
        assert "Username already exists" in response.json()["detail"]
    
    def test_register_user_invalid_data(self, setup_database):
        """Test registration with invalid data."""
        user_data = {
            "username": "",  # Empty username
            "email": "invalid-email",  # Invalid email format
            "password": "123",  # Too short password
            "user_type": "invalid_type"  # Invalid user type
        }
        
        response = client.post("/api/user/register", json=user_data)
        
        assert response.status_code == 422  # Validation error


class TestUserAuthentication:
    """Test user authentication functionality."""
    
    def test_login_success(self, create_test_user, test_user_data):
        """Test successful login."""
        login_data = {
            "username": test_user_data["username"],
            "password": test_user_data["password"]
        }
        
        response = client.post("/api/user/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert "access_token" in data["data"]
        assert data["data"]["token_type"] == "bearer"
        assert data["data"]["username"] == test_user_data["username"]
        assert data["data"]["user_type"] == "seller"
        assert "expires_in" in data["data"]
    
    def test_login_invalid_username(self, setup_database):
        """Test login with invalid username."""
        login_data = {
            "username": "nonexistent",
            "password": "password123"
        }
        
        response = client.post("/api/user/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_invalid_password(self, create_test_user, test_user_data):
        """Test login with invalid password."""
        login_data = {
            "username": test_user_data["username"],
            "password": "wrongpassword"
        }
        
        response = client.post("/api/user/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_missing_fields(self, setup_database):
        """Test login with missing fields."""
        login_data = {
            "username": "testuser"
            # Missing password
        }
        
        response = client.post("/api/user/login", json=login_data)
        
        assert response.status_code == 422  # Validation error


class TestJWTToken:
    """Test JWT token functionality."""
    
    def test_token_structure(self, create_test_user, test_user_data):
        """Test JWT token structure and content."""
        login_data = {
            "username": test_user_data["username"],
            "password": test_user_data["password"]
        }
        
        response = client.post("/api/user/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        token = data["data"]["access_token"]
        
        # Basic token structure check (JWT has 3 parts separated by dots)
        token_parts = token.split(".")
        assert len(token_parts) == 3
        
        # Check token response fields
        assert isinstance(data["data"]["user_id"], int)
        assert isinstance(data["data"]["expires_in"], int)
        assert data["data"]["expires_in"] > 0


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
