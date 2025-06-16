from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException 

from apps.user.schemas import CreateUser
from apps.user.services import get_user_by_username
from apps.common.custom_response import CustomJSONResponse
from apps.user.services import create_user


def register_user_view(user: CreateUser, db):
    """
    Register a new user.
    """
    try:
        # Check if the user already exists
        existing_user = get_user_by_username(db, user.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        new_user_created = create_user(db, user)
        if  not new_user_created:
            raise HTTPException(status_code=500, detail="User creation failed")
        return CustomJSONResponse(
        content={"user": jsonable_encoder(user)},
            message="User registered successfully",
            status_code=201
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))