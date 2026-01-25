from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from services.SavantMerger import SavantMerger, SavantScraper, valid_url
from services.SavantQuery import SavantQuery
from services.JobStore import JobStore
from services.database import get_db, SessionLocal
from models.custom_models import Query
from models.job import JobStatus
import aiohttp
import os
from dotenv import load_dotenv
import uuid
from limiter import limiter, ai_limit

load_dotenv('../.env')

OUTPUT_PATH = os.environ.get('OUTPUT_PATH')

router = APIRouter()

# job status
@router.get('/status/{job_id}')
@limiter.exempt
def get_job_status(request: Request, job_id: str, db: Session = Depends(get_db)):
    store = JobStore(db)
    job = store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "status": job.status,
        "video_url": job.video_url,
        "error_message": job.error_message
    }

# serve the video
@router.get('/stream/{job_id}')
@limiter.exempt
def stream_video(request: Request, job_id: str, db: Session = Depends(get_db)):
    store = JobStore(db)
    job = store.get_job(job_id)
    if not job or not job.video_url:
        raise HTTPException(status_code=404, detail="Video not found")

    if not os.path.exists(job.video_url):
        raise HTTPException(status_code=404, detail="Video file not found")

    return FileResponse(job.video_url, media_type='video/mp4')

# url merging
@router.post('/merge-url')
@limiter.limit("2/minute")
def merge_from_url(request: Request, url: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid Baseball Savant URL")

    if not OUTPUT_PATH:
        raise HTTPException(status_code=400, detail="Invalid output path specified")

    store = JobStore(db)
    job = store.create_job()

    output_file = os.path.join(OUTPUT_PATH, f'output_{uuid.uuid4()}.mp4')

    background_tasks.add_task(process_video, url, output_file, job.id)

    return {
        "message": "Video processing started",
        "job_id": job.id
    }

# natural language merging
@router.post('/merge-query')
@limiter.limit("2/minute")
async def merge_from_query(request: Request, query: Query, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # process query and generate url
    try:
        service = SavantQuery()
        result = await service.process_query(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

    if not valid_url(result.url):
        raise HTTPException(status_code=400, detail="Invalid Baseball Savant URL")

    if not OUTPUT_PATH:
        raise HTTPException(status_code=400, detail="Invalid output path specified")

    output_file = os.path.join(OUTPUT_PATH, f'output_{uuid.uuid4()}.mp4')

    store = JobStore(db)
    job = store.create_job()

    background_tasks.add_task(process_video, result.url, output_file, job.id)

    return {
        "message": "Video processing started",
        "original_query": query.query,
        "generated_url": result.url,
        "filters": result.filters,
        "job_id": job.id
    }

# url processing - this is for testing
@router.post('/process-query')
@limiter.limit("2/minute")
async def process_query(request: Request, query: Query):
    try:
        service = SavantQuery()
        result = await service.process_query(query)
        return {
            "message": "Query processed successfully",
            "original_query": query.query,
            "generated_url": result.url,
            "filters": result.filters
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

async def process_video(url: str, output_file: str, job_id: str):
    db = SessionLocal()

    try:
        store = JobStore(db)
        store.update_job_status(job_id, JobStatus.PROCESSING)

        connector = aiohttp.TCPConnector(limit=100, limit_per_host=10)
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        async with aiohttp.ClientSession(connector=connector, headers=headers) as session:

            ss = SavantScraper(url)

            store.update_job_status(job_id, JobStatus.PARSING_PAGE)
            await ss.parse_savant_page(session)
            await ss.get_mp4_links(session)

            sm = SavantMerger(ss.video_data_list,output_file)
            store.update_job_status(job_id, JobStatus.DOWNLOADING_VIDEOS)
            await sm.download_videos(session)

            store.update_job_status(job_id, JobStatus.MERGING_VIDEOS)
            sm.merge_videos()

            store.update_job_status(job_id, JobStatus.COMPLETE, output_file)
    except Exception as e:
        print(f"Video processing failed: {e}")
        store.update_job_status(job_id, JobStatus.FAILED)
    finally:
        db.close()
