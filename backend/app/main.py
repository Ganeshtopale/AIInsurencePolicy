import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from app.config import settings
from app.database import engine, Base
from app.models import *
from app.ws_manager import manager

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
if settings.DEBUG:
    logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        from sqlalchemy import text as sa_text
        # Add missing columns for existing tables (migration helper)
        for col_name, col_def in [("user_id", "INTEGER REFERENCES users(id)")]:
            try:
                await conn.execute(sa_text(f"ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
            except Exception:
                pass  # table might not exist yet
    logger.info("Database tables created / verified")
    yield
    await engine.dispose()
    logger.info("Database engine disposed")


app = FastAPI(title="AI Insurance Marketplace", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    body = None
    if request.method in ("POST", "PUT", "PATCH") and request.headers.get("content-type") == "application/json":
        try:
            body = await request.json()
        except Exception:
            body = "(unparseable body)"
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    logger.info(
        "%s %s → %s (%.1fms)%s",
        request.method,
        request.url.path,
        response.status_code,
        elapsed * 1000,
        f" body={body}" if body else "",
    )
    return response


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/seed")
async def seed_data():
    from app.seed import seed_database
    await seed_database()
    return {"status": "Database seeded successfully"}


@app.websocket("/ws/agent/{user_id}")
async def agent_websocket(ws: WebSocket, user_id: int):
    await manager.connect_agent(user_id, ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_agent(user_id)


@app.websocket("/ws/customer/{user_id}")
async def customer_websocket(ws: WebSocket, user_id: int):
    await manager.connect_customer(user_id, ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_customer(user_id)


try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except RuntimeError:
    pass

try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
except RuntimeError:
    pass


from app.api import api_router
app.include_router(api_router)
