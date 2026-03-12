from pydantic import BaseModel

from models.job import JobStatus


class StreamSearchUrlResponse(BaseModel):
    job_id: str


class StreamSearchQueryResponse(BaseModel):
    job_id: str
    generated_url: str
    filter_display: dict


class JobStatusResponse(BaseModel):
    status: JobStatus
    video_url: str | None = None
    error_message: str | None = None


class DownloadStartResponse(BaseModel):
    download_job_id: str


class ProcessQueryResponse(BaseModel):
    message: str
    original_query: str
    generated_url: str
    filter_display: dict


class ProcessUrlResponse(BaseModel):
    message: str
    url: str
