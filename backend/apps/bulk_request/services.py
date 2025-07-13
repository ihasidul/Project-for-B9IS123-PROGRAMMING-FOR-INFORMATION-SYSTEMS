from typing import Union, Optional
from fastapi import HTTPException
from sqlalchemy import select, func, or_, asc, desc
from sqlalchemy.orm import Session
from apps.bulk_request.models import BulkRequest, BulkRequestPledge, BulkRequestStatus
from apps.bulk_request.schemas import BulkRequestCreate


def get_all_bulk_requests(
    db_session: Session,
    page: int = 1,
    limit: int = 10,
    search: Union[str, None] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    min_quantity: Optional[float] = None,
    max_quantity: Optional[float] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    buyer_id: Optional[int] = None,
) -> dict:
    """
    Fetch bulk requests from the database with pagination, filtering, and sorting.
    """
    try:
        offset = (page - 1) * limit
        stmt = select(BulkRequest)

        # Apply filters
        if search:
            search_pattern = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(BulkRequest.title).like(search_pattern),
                    func.lower(BulkRequest.description).like(search_pattern),
                    func.lower(BulkRequest.product_name).like(search_pattern),
                )
            )

        if buyer_id is not None:
            stmt = stmt.where(BulkRequest.buyer_id == buyer_id)

        if category_id is not None:
            stmt = stmt.where(BulkRequest.category_id == category_id)
        print("*" * 80)
        print(f"Status: {status}")
        print("*" * 80)
        if status is not None:
            stmt = stmt.where(BulkRequest.status == status)

        if min_quantity is not None:
            stmt = stmt.where(BulkRequest.quantity_needed >= min_quantity)

        if max_quantity is not None:
            stmt = stmt.where(BulkRequest.quantity_needed <= max_quantity)

        if min_price is not None:
            stmt = stmt.where(BulkRequest.max_price_per_unit >= min_price)

        if max_price is not None:
            stmt = stmt.where(BulkRequest.max_price_per_unit <= max_price)

        # Apply sorting
        sort_column = getattr(BulkRequest, sort_by, BulkRequest.created_at)
        if sort_order == "desc":
            stmt = stmt.order_by(desc(sort_column))
        else:
            stmt = stmt.order_by(asc(sort_column))

        # Get total count for pagination
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = db_session.execute(count_stmt).scalar()
        total_count = total_count or 0  # If it's None, set it to 0

        # Apply pagination
        stmt = stmt.offset(offset).limit(limit)

        # Execute query
        result = db_session.execute(stmt)
        bulk_requests = result.scalars().all()

        return {
            "success": True,
            "bulk_requests": bulk_requests,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit,
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching bulk requests: {str(e)}"
        )


def create_bulk_request(
    db_session: Session, bulk_request_data: BulkRequestCreate, buyer_id: int
):
    """
    Create a new bulk request.
    """
    try:
        bulk_request = BulkRequest(
            title=bulk_request_data.title,
            description=bulk_request_data.description,
            product_name=bulk_request_data.product_name,
            category_id=bulk_request_data.category_id,
            quantity_needed=bulk_request_data.quantity_needed,
            unit=bulk_request_data.unit,
            max_price_per_unit=bulk_request_data.max_price_per_unit,
            total_budget=bulk_request_data.total_budget,
            delivery_deadline=bulk_request_data.delivery_deadline,
            delivery_location=bulk_request_data.delivery_location,
            delivery_instructions=bulk_request_data.delivery_instructions,
            buyer_id=buyer_id,
            status=BulkRequestStatus.OPEN,
        )

        db_session.add(bulk_request)
        db_session.commit()
        db_session.refresh(bulk_request)

        return {"success": True, "bulk_request": bulk_request}

    except Exception as e:
        db_session.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error creating bulk request: {str(e)}"
        )


def bulk_request_exists_for_user(db_session: Session, buyer_id: int, title: str):
    """
    Check if a bulk request with the same title exists for a user.
    """
    try:
        stmt = select(BulkRequest).where(
            BulkRequest.buyer_id == buyer_id, BulkRequest.title == title
        )
        result = db_session.execute(stmt)
        bulk_request = result.scalar_one_or_none()
        return bulk_request is not None

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error checking bulk request existence: {str(e)}"
        )
