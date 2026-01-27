from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import asyncio
import os
from services.database import SessionLocal
from models.job import Base, Job
import logging

logger = logging.getLogger(__name__)

async def cleanup_old_jobs():
    while True:
        await asyncio.sleep(3600)  # Run every hour

        db = SessionLocal()
        try:
            cutoff = datetime.utcnow() - timedelta(days=1)
            old_jobs = db.query(Job).filter(Job.created_at < cutoff).all()

            for job in old_jobs:
                # delete video file
                if job.video_url and os.path.exists(job.video_url):
                    os.remove(job.video_url)
                    db.delete(job)

            db.commit()
            logger.info(f"Cleaned up {len(old_jobs)} old jobs")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        finally:
            db.close()
