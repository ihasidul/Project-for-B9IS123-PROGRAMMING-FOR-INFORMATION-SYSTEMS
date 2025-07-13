from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from apps.bulk_request.services import (
    get_all_bulk_requests,
    create_bulk_request,
    bulk_request_exists_for_user,
)
from apps.bulk_request.schemas import (
    BulkRequestCreate,
    BulkRequestUpdate,
    BulkRequestListQueryParams,
)
from apps.common.custom_response import CustomJSONResponse


def get_bulk_requests_view(
    db: Session, user_id: int, user_type: str, query_params: BulkRequestListQueryParams
) -> CustomJSONResponse:
    """
    Get all bulk requests with filtering and pagination.
    """
    try:
        # For business users, show only their requests
        # For farmers/sellers, show all open requests they can pledge to
        buyer_id = user_id if user_type == "business" else None

        result = get_all_bulk_requests(
            db_session=db,
            page=query_params.page,
            limit=query_params.limit,
            search=query_params.search,
            category_id=query_params.category_id,
            status=query_params.status,
            min_quantity=query_params.min_quantity,
            max_quantity=query_params.max_quantity,
            min_price=query_params.min_price,
            max_price=query_params.max_price,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order,
            buyer_id=buyer_id,
        )

        if result["success"]:
            return CustomJSONResponse(
                content={
                    "data": jsonable_encoder(result["bulk_requests"]),
                    "pagination": result["pagination"],
                },
                message="Bulk Request List",
                status_code=200,
            )
        else:
            return CustomJSONResponse(
                content={},
                message=result["error"],
                status_code=500,
            )

    except Exception as e:
        return CustomJSONResponse(
            content={},
            message=str(e),
            status_code=500,
        )


def create_bulk_request_view(
    bulk_request_data: BulkRequestCreate, db: Session, user_id: int
) -> CustomJSONResponse:
    """
    Create a new bulk request for a business user.
    """
    try:
        # Check if user already has a bulk request with the same title
        if bulk_request_exists_for_user(db, user_id, bulk_request_data.title):
            return CustomJSONResponse(
                content={},
                message="A bulk request with this title already exists for this user",
                status_code=400,
            )
        # Create the bulk request
        print("*" * 80)
        print("WOrking ")
        print("*" * 80)
        result = create_bulk_request(db, bulk_request_data, user_id)

        if result["success"]:
            return CustomJSONResponse(
                content={
                    "data": jsonable_encoder(result["bulk_request"]),
                },
                message="Bulk request created successfully",
                status_code=201,
            )
        else:
            return CustomJSONResponse(
                content={},
                message=result["error"],
                status_code=400,
            )

    except Exception as e:
        return CustomJSONResponse(
            content={},
            message=str(e),
            status_code=500,
        )
