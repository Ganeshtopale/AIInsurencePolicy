from fastapi import WebSocket
from typing import Set, Dict
import json


class ConnectionManager:
    def __init__(self):
        self.agent_connections: Dict[int, WebSocket] = {}
        self.customer_connections: Dict[int, WebSocket] = {}

    async def connect_agent(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.agent_connections[user_id] = ws

    async def connect_customer(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.customer_connections[user_id] = ws

    def disconnect_agent(self, user_id: int):
        self.agent_connections.pop(user_id, None)

    def disconnect_customer(self, user_id: int):
        self.customer_connections.pop(user_id, None)

    async def broadcast_to_agents(self, message: dict):
        payload = json.dumps(message)
        dead = []
        for uid, ws in self.agent_connections.items():
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(uid)
        for uid in dead:
            self.agent_connections.pop(uid, None)

    async def send_to_customer(self, user_id: int, message: dict):
        ws = self.customer_connections.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                self.customer_connections.pop(user_id, None)


manager = ConnectionManager()
