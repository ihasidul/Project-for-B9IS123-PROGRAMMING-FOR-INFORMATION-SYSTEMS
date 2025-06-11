from datetime import datetime, timezone
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from apps.common.database import Base

class BaseDatabaseModel(Base):
    __abstract__ = True