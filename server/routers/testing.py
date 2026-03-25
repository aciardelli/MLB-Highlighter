from fastapi import APIRouter, HTTPException, Request
from services.SavantScraper import valid_url
from services.SavantQuery import SavantQuery
from models.query import Query
from models.responses import ProcessQueryResponse, ProcessUrlResponse
from limiter import limiter

router = APIRouter()

@router.post('/process-query')
@limiter.limit("2/minute")
async def test_process_query(request: Request, query: Query):
    """Test endpoint: process a natural language query into a Savant URL."""
    try:
        service = SavantQuery()
        result = await service.process_query(query)
        return ProcessQueryResponse(
            message="Query processed successfully",
            original_query=query.query,
            generated_url=result.url,
            filter_display=result.filters.get_filter_display(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")


@router.post('/process-url')
@limiter.limit("2/minute")
async def test_process_url(request: Request, url: str):
    """Test endpoint: validate a Baseball Savant URL."""
    if not valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid Baseball Savant URL")

    return ProcessUrlResponse(
        message="URL is valid",
        url=url,
    )
