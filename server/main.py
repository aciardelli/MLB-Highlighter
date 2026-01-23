from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import video
from models.job import Base
from services.database import engine
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database")
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allows all origins
    allow_credentials=True,         # Allows cookies/authorization headers to be sent
    allow_methods=["*"],            # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allows all headers
)

app.include_router(video.router, prefix="/video", tags=["video"])

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
