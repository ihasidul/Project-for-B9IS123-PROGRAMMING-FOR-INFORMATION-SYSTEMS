from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from apps.common.database import get_db
from apps.user.schemas import CreateUser, LoginRequest
from apps.user.views import register_user_view, login_view

router = APIRouter(
    prefix="/user", tags=["user"], responses={404: {"description": "Not found"}}
)


@router.post("/register")
def register_user_route(create_user: CreateUser, db=Depends(get_db)):
    """
    Register a new user.
    """
    try:
        return register_user_view(create_user, db)
    except Exception as e:
        print(f"Error in register_user_route: {str(e)}")
        raise e


@router.post("/login")
def login_route(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    User login endpoint.
    Returns JWT access token on successful authentication.
    """
    return login_view(login_data, db)
