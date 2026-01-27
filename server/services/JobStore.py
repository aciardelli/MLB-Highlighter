from sqlalchemy.orm import Session
from models.job import Job, JobStatus

class JobStore():
    def __init__(self, db: Session):
        self.db = db

    # create job
    def create_job(self):
        job = Job()
        self.db.add(job)
        self.db.commit()
        return job

    # update job
    def update_job_status(self, job_id: str, status: JobStatus, video_url: str = None, error_message: str = None):
        job = self.get_job(job_id)
        job.status = status
        if video_url:
            job.video_url = video_url
        if error_message:
            job.error_message = error_message
        self.db.commit()

    # fetch job
    def get_job(self, job_id: str):
        return self.db.get(Job, job_id)

