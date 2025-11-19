from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from services.SavantMerger import SavantMerger, valid_url
from services.SavantQuery import SavantQuery
from custom_models import Query
import os
import uuid

router = APIRouter()

@router.post('/merge-url')
def merge_from_url(url: str, background_tasks: BackgroundTasks):
    if not valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid Baseball Savant URL")

    output_file = f"output_{uuid.uuid4()}.mp4"

    background_tasks.add_task(process_video, url, output_file)

    return {
        "message": "Video processing started",
        "output_file": output_file
    }

@router.post('/merge-query')
def merge_from_query(query: Query):
    return {
        "message": "Processing query",
        "query": query
    }

@router.post('/process-query')
async def process_query(query: Query):
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

def process_video(url: str, output_file: str):
    try:
        sm = SavantMerger(url,output_file)
        sm.parse_savant_page()
        sm.get_mp4s()
        sm.download_videos()
        sm.merge_videos()
    except Exception as e:
        print(f"Video processing failed: {e}")
