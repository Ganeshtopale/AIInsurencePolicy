from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.models import *
from app.ws_manager import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="AI Insurance Marketplace", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
