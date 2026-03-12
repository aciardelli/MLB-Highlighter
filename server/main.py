from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from routers import video, video_testing
from services.JobStore import job_store
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
import asyncio
import logging
import os

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_task = asyncio.create_task(job_store.cleanup_old_jobs())
    yield
    cleanup_task.cancel()

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "https://savant-search.vercel.app",
    "https://www.mlbhighlighter.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video.router, prefix="/video", tags=["video"])
app.include_router(video_testing.router, prefix="/video/testing", tags=["testing"])

@app.get("/health")
@limiter.exempt
async def health(request: Request):
    return {
        "message": "YOUR SERVER IS WORKING"
    }

@app.get("/")
@limiter.exempt
async def root(request: Request):
    return {
        "message": "Hello world"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
