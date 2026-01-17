from datetime import datetime
from enum import Enum
from sqlalchemy import String, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from uuid import uuid4

class Base(DeclarativeBase):
    pass

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"

class Job(Base):
    __tablename__ = 'jobs'

    id: Mapped[str] = mapped_column(String(36), primary_key = True, default=lambda: str(uuid4()))
    status: Mapped[JobStatus] = mapped_column(String(20), default=JobStatus.PENDING)
    video_url: Mapped[str | None] = mapped_column(String(200), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

