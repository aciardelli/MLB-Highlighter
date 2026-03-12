from datetime import datetime, timedelta
from uuid import uuid4
from models.job import Job, JobStatus, VideoClipMetadata, VideoUrlEvent, CompleteEvent, StatusUpdateEvent
import asyncio
import logging
import os

logger = logging.getLogger(__name__)

class JobStore:
    def __init__(self):
        self.jobs: dict[str, Job] = {}

    def create_job(self) -> Job:
        job_id = str(uuid4())
        job = Job(id=job_id)
        self.jobs[job_id] = job
        return job

    def get_job(self, job_id: str) -> Job | None:
        return self.jobs.get(job_id)

    def update_status(self, job_id: str, status: JobStatus, video_url: str = None, error_message: str = None):
        job = self.get_job(job_id)
        if not job:
            return
        job.status = status
        if video_url:
            job.video_url = video_url
        if error_message:
            job.error_message = str(error_message)
        event = StatusUpdateEvent(
            status=status.value,
            video_url=video_url,
            error_message=job.error_message,
        )
        job.queue.put_nowait(event.model_dump())

    def emit_video_url(self, job_id: str, url: str, index: int, metadata: VideoClipMetadata):
        job = self.get_job(job_id)
        if not job:
            return
        event = VideoUrlEvent(url=url, index=index, metadata=metadata)
        job.queue.put_nowait(event.model_dump())

    def emit_complete(self, job_id: str, total: int):
        job = self.get_job(job_id)
        if not job:
            return
        event = CompleteEvent(total=total)
        job.queue.put_nowait(event.model_dump())

    def store_video_data(self, job_id: str, video_data_list: list):
        job = self.get_job(job_id)
        if not job:
            return
        job.video_data_list = video_data_list

    async def cleanup_old_jobs(self):
        while True:
            await asyncio.sleep(3600)
            cutoff = datetime.utcnow() - timedelta(days=1)
            to_delete = [
                job_id for job_id, job in self.jobs.items()
                if job.created_at < cutoff
            ]
            for job_id in to_delete:
                job = self.jobs.pop(job_id)
                if job.video_url and os.path.exists(job.video_url):
                    os.remove(job.video_url)
            logger.info(f"Cleaned up {len(to_delete)} old jobs")

job_store = JobStore()
