from enum import Enum
from datetime import datetime
from typing import Literal
import asyncio

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    PENDING = "pending"
    PARSING_PAGE = "parsing"
    DOWNLOADING_VIDEOS = "downloading"
    MERGING_VIDEOS = "merging"
    PROCESSING = "processing"
    STREAMING_URLS = "streaming"
    COMPLETE = "complete"
    FAILED = "failed"


class VideoClipMetadata(BaseModel):
    batter: str | None = None
    pitcher: str | None = None
    pitch_type: str | None = None
    pitch_velo: str | None = None
    exit_velo: str | None = None
    distance: str | None = None
    date: str | None = None
    matchup: str | None = None
    count: str | None = None


class VideoUrlEvent(BaseModel):
    type: Literal["video_url"] = "video_url"
    url: str
    index: int
    metadata: VideoClipMetadata


class CompleteEvent(BaseModel):
    type: Literal["complete"] = "complete"
    total: int


class StatusUpdateEvent(BaseModel):
    status: str
    video_url: str | None = None
    error_message: str | None = None


class Job(BaseModel):
    model_config = {"arbitrary_types_allowed": True}

    id: str
    status: JobStatus = JobStatus.PENDING
    video_url: str | None = None
    error_message: str | None = None
    video_data_list: list = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    queue: asyncio.Queue = Field(default_factory=asyncio.Queue, exclude=True)
