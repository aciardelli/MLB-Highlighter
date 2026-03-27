from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from services.GameService import fetch_schedule, fetch_game_plays
from services.JobStore import job_store
from services.background_tasks import stream_game_highlights
from models.game import ScheduleRequest, GamePlaysRequest, GameHighlightsRequest, get_team_id
from limiter import limiter
import aiohttp
import logging

logger = logging.getLogger(__name__)

AIOHTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

router = APIRouter()


@router.post("/schedule")
@limiter.limit("10/minute")
async def get_schedule(request: Request, body: ScheduleRequest):
    """Fetch MLB games for a team over a date range."""
    try:
        team_id = get_team_id(body.team_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    start, end = body.get_date_range()

    try:
        async with aiohttp.ClientSession(headers=AIOHTTP_HEADERS) as session:
            games = await fetch_schedule(session, team_id, start.isoformat(), end.isoformat())
    except aiohttp.ClientError as e:
        logger.error(f"MLB API error fetching schedule: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch schedule from MLB API")

    return {
        "games": games,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "team_name": body.team_name,
    }


@router.post("/plays")
@limiter.limit("10/minute")
async def get_game_plays(request: Request, body: GamePlaysRequest):
    """Fetch all plays from a specific game."""
    try:
        async with aiohttp.ClientSession(headers=AIOHTTP_HEADERS) as session:
            result = await fetch_game_plays(session, body.game_pk)
    except aiohttp.ClientError as e:
        logger.error(f"MLB API error fetching plays: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch game data from MLB API")

    return result


@router.post("/highlights/stream")
@limiter.limit("2/minute")
async def stream_highlights(request: Request, body: GameHighlightsRequest, background_tasks: BackgroundTasks):
    """Start streaming video URLs for all plays in a game."""
    try:
        async with aiohttp.ClientSession(headers=AIOHTTP_HEADERS) as session:
            result = await fetch_game_plays(session, body.game_pk)
    except aiohttp.ClientError as e:
        logger.error(f"MLB API error fetching plays for highlights: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch game data from MLB API")

    plays = [p for p in result["plays"] if p.get("play_id")]

    if body.play_ids is not None:
        requested_ids = set(body.play_ids)
        plays = [p for p in plays if p["play_id"] in requested_ids]

    if not plays:
        raise HTTPException(status_code=404, detail="No plays with video found for this game")

    job = job_store.create_job()
    background_tasks.add_task(stream_game_highlights, plays, job.id)

    return {
        "job_id": job.id,
        "total_plays": len(plays),
        "game_pk": body.game_pk,
    }
