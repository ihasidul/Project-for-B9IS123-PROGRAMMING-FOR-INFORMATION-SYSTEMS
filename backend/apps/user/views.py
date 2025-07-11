from datetime import timedelta
from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from apps.user.schemas import CreateUser, LoginRequest, TokenResponse
from apps.user.services import (
    get_user_by_username,
    create_user,
    authenticate_user,
    create_access_token,
)
from apps.common.custom_response import CustomJSONResponse
from config import ACCESS_TOKEN_EXPIRE_MINUTES


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
        if not new_user_created:
            raise HTTPException(status_code=500, detail="User creation failed")
        return CustomJSONResponse(
            content={"user": jsonable_encoder(user)},
            message="User registered successfully",
            status_code=201,
        )
    except HTTPException:
        # Re-raise HTTPExceptions as-is (they have proper status codes)
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def login_view(login_data: LoginRequest, db: Session) -> CustomJSONResponse:
    """
    Handle user login and return JWT token.
    """
    try:
        # Authenticate user
        user = authenticate_user(db, login_data.username, login_data.password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        token_data = {
            "user_id": user.id,
            "username": user.username,
            "user_type": user.user_type.value,
        }
        access_token = create_access_token(
            data=token_data, expires_delta=access_token_expires
        )

        # Prepare response
        token_response = TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(ACCESS_TOKEN_EXPIRE_MINUTES * 60),  # Convert to seconds
            user_id=user.id,
            username=user.username,
            user_type=user.user_type.value,
        )

        return CustomJSONResponse(
            content=token_response.model_dump(),
            message="Login successful",
            status_code=200,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )
