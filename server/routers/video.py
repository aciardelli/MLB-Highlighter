from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from services.SavantMerger import valid_url
from services.SavantQuery import SavantQuery
from services.JobStore import job_store
from services.background_tasks import scrape_and_stream_urls, download_and_merge
from models.query import Query
from models.job import JobStatus
import asyncio
import json
import os
from dotenv import load_dotenv
from limiter import limiter, ai_limit
import logging

logger = logging.getLogger(__name__)

load_dotenv('../.env')

BASE_OUTPUT_PATH = os.environ.get('BASE_OUTPUT_PATH')

router = APIRouter()

# sse job status
@router.get('/status/{job_id}/stream')
@limiter.exempt
async def stream_job_status(request: Request, job_id: str):
    """event stream of the job's status'"""
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        queue: asyncio.Queue = job["queue"]
        while True:
            update = await queue.get()
            msg_type = update.get("type")

            if msg_type == "video_url":
                yield f"event: video_url\ndata: {json.dumps(update)}\n\n"
            elif msg_type == "complete":
                yield f"event: complete\ndata: {json.dumps(update)}\n\n"
                break
            else:
                # Legacy status messages (for download progress / old endpoints)
                yield f"data: {json.dumps(update)}\n\n"
                if update.get("status") in (JobStatus.COMPLETE.value, JobStatus.FAILED.value):
                    break

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# polling job status
@router.get('/status/{job_id}')
@limiter.exempt
def get_job_status(request: Request, job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "status": job["status"],
        "video_url": job["video_url"],
        "error_message": job["error_message"],
    }

# download the merged videos
@router.get('/download/merged/{job_id}')
@limiter.exempt
def stream_video(request: Request, job_id: str):
    job = job_store.get_job(job_id)
    if not job or not job["video_url"]:
        raise HTTPException(status_code=404, detail="Video not found")

    if not os.path.exists(job["video_url"]):
        raise HTTPException(status_code=404, detail="Video file not found")

    return FileResponse(job["video_url"], media_type='video/mp4')

# query streaming
@router.post('/stream-query')
@limiter.limit("2/minute")
async def stream_from_query(request: Request, query: Query, background_tasks: BackgroundTasks):
    try:
        service = SavantQuery()
        result = await service.process_query(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

    if not valid_url(result.url):
        raise HTTPException(status_code=400, detail="Invalid Baseball Savant URL")

    job = job_store.create_job()
    background_tasks.add_task(scrape_and_stream_urls, result.url, job["id"])

    return {
        "job_id": job["id"],
        "generated_url": result.url,
        "filter_display": result.filters.get_filter_display(),
    }

# url streaming
@router.post('/stream-url')
@limiter.limit("2/minute")
def stream_from_url(request: Request, url: str, background_tasks: BackgroundTasks):
    if not valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid Baseball Savant URL")

    job = job_store.create_job()
    background_tasks.add_task(scrape_and_stream_urls, url, job["id"])

    return {
        "job_id": job["id"],
    }

# start the download process
@router.post('/download/start/{job_id}')
@limiter.limit("2/minute")
def download_merged(request: Request, job_id: str, background_tasks: BackgroundTasks):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    video_data_list = job.get("video_data_list", [])
    if not video_data_list:
        raise HTTPException(status_code=400, detail="No video data available for this job")

    if not BASE_OUTPUT_PATH:
        raise HTTPException(status_code=400, detail="Invalid output path specified")

    download_job = job_store.create_job()
    output_path = os.path.join(BASE_OUTPUT_PATH, f"{download_job['id']}.mp4")

    background_tasks.add_task(download_and_merge, video_data_list, output_path, download_job["id"])

    return {
        "download_job_id": download_job["id"],
    }

