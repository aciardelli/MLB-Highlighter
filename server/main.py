from fastapi import FastAPI
from contextlib import asynccontextmanager
from routers import video
from models.job import Base
from services.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database")
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

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
