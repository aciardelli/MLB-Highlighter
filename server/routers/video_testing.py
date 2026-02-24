from fastapi import APIRouter, HTTPException, Request
from services.SavantMerger import valid_url
from services.SavantQuery import SavantQuery
from models.schemas import Query
from limiter import limiter

router = APIRouter()

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
            "filter_display": result.filters.get_filter_display(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

@router.post('/process-url')
@limiter.limit("2/minute")
async def process_url(request: Request, url: str):
    if not valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid Baseball Savant URL")

    return {
        "message": "URL is valid",
        "url": url,
    }
