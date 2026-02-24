from datetime import datetime, timedelta
from uuid import uuid4
from models.job import JobStatus
import asyncio
import logging
import os

logger = logging.getLogger(__name__)

class JobStore:
    def __init__(self):
        self.jobs: dict[str, dict] = {}

    def create_job(self) -> dict:
        job_id = str(uuid4())
        self.jobs[job_id] = {
            "id": job_id,
            "status": JobStatus.PENDING,
            "video_url": None,
            "error_message": None,
            "video_data_list": [],
            "created_at": datetime.utcnow(),
            "queue": asyncio.Queue(),
        }
        return self.jobs[job_id]

    def get_job(self, job_id: str) -> dict | None:
        return self.jobs.get(job_id)

    def update_status(self, job_id: str, status: JobStatus, video_url: str = None, error_message: str = None):
        job = self.get_job(job_id)
        if not job:
            return
        job["status"] = status
        if video_url:
            job["video_url"] = video_url
        if error_message:
            job["error_message"] = str(error_message)
        job["queue"].put_nowait({
            "status": status.value,
            "video_url": video_url,
            "error_message": job["error_message"],
        })

    def emit_video_url(self, job_id: str, url: str, index: int, metadata: dict):
        job = self.get_job(job_id)
        if not job:
            return
        job["queue"].put_nowait({
            "type": "video_url",
            "url": url,
            "index": index,
            "metadata": metadata,
        })

    def emit_complete(self, job_id: str, total: int):
        job = self.get_job(job_id)
        if not job:
            return
        job["queue"].put_nowait({
            "type": "complete",
            "total": total,
        })

    def store_video_data(self, job_id: str, video_data_list: list):
        job = self.get_job(job_id)
        if not job:
            return
        job["video_data_list"] = video_data_list

    async def cleanup_old_jobs(self):
        while True:
            await asyncio.sleep(3600)
            cutoff = datetime.utcnow() - timedelta(days=1)
            to_delete = [
                job_id for job_id, job in self.jobs.items()
                if job["created_at"] < cutoff
            ]
            for job_id in to_delete:
                job = self.jobs.pop(job_id)
                if job["video_url"] and os.path.exists(job["video_url"]):
                    os.remove(job["video_url"])
            logger.info(f"Cleaned up {len(to_delete)} old jobs")

job_store = JobStore()
