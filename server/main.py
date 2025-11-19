from fastapi import FastAPI
from routers import video

app = FastAPI()

app.include_router(video.router, prefix="/video", tags=["video"])

@app.get("/health")
async def health():
    return {
        "message": "YOUR SERVER IS WORKING"
    }

@app.get("/")
async def root():
    return {
        "message": "Hello world"
    }
