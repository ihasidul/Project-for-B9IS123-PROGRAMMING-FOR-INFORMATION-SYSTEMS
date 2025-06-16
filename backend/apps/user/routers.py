from fastapi import APIRouter
from fastapi import Depends
from apps.common.database import get_db
from apps.user.schemas import CreateUser
from apps.user.views import register_user_view

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}}
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


    

