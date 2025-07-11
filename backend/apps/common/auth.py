from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from apps.common.database import get_db
from apps.user.models import User, UserTypeEnum
from apps.user.services import get_current_user


# Security scheme for JWT token
security = HTTPBearer()


def is_authenticated(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Authentication middleware that adds user_id and user_type to request object.
    Raises HTTPException with 401 status if token is invalid or user not found.

    Usage: Add as dependency to any endpoint that requires authentication.
    After calling this middleware, you can access:
    - request.state.user_id
    - request.state.user_type
    - request.state.username
    - request.state.user_email
    """
    try:
        token = credentials.credentials

        # Get user from database (this also verifies the token)
        user = get_current_user(db, token)

        # Add user information to request state
        request.state.user_id = user.id
        request.state.user_type = user.user_type.value
        request.state.username = user.username
        request.state.user_email = user.email

        return True

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
