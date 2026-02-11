from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    PARSING_PAGE = "parsing"
    DOWNLOADING_VIDEOS = "downloading"
    MERGING_VIDEOS = "merging"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"
