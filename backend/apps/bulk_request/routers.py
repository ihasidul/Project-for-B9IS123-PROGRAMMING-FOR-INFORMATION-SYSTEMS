from fastapi import APIRouter, Request, HTTPException, Depends
from apps.bulk_request.schemas import (
    BulkRequestCreate,
    BulkRequestUpdate,
    BulkRequestListQueryParams,
)
from apps.user.models import UserTypeEnum
from apps.common.database import get_db
from apps.bulk_request.views import (
    get_bulk_requests_view,
    create_bulk_request_view,
)
from apps.common.custom_response import CustomJSONResponse
from apps.common.auth import is_authenticated


router = APIRouter(
    prefix="/bulk-request",
    tags=["bulk-request"],
    responses={404: {"description": "Not found"}},
)


@router.get("")
def get_bulk_requests_route(
    request: Request,
    query_params: BulkRequestListQueryParams = Depends(),
    db=Depends(get_db),
    is_authenticated=Depends(is_authenticated),
) -> CustomJSONResponse:
    """
    Get bulk requests with filtering and pagination.
    Business users see their own requests.
    Farmers/sellers see all open requests they can pledge to.
    """
    try:
        user_id = request.state.user_id
        user_type = request.state.user_type

        return get_bulk_requests_view(db, user_id, user_type, query_params)

    except Exception as e:
        print(f"Error in get_bulk_requests_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
def create_bulk_request_route(
    request: Request,
    bulk_request: BulkRequestCreate,
    db=Depends(get_db),
    is_authenticated=Depends(is_authenticated),
) -> CustomJSONResponse:
    """
    Create a new bulk request.
    Only business users can create bulk requests.
    """
    try:
        print("IN CREATE BULK REQUEST ROUTE")
        user_id = request.state.user_id
        user_type = request.state.user_type

        # Only business users can create bulk requests
        if user_type != UserTypeEnum.business.value:
            raise HTTPException(
                status_code=403,
                detail="Only business users can create bulk requests",
            )
        return create_bulk_request_view(bulk_request, db, user_id)

    except Exception as e:
        print(f"Error in create_bulk_request_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
