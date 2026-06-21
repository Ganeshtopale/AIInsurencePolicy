from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatMessageIn(BaseModel):
    message: str
    session_id: Optional[str] = None


class MessageContent(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class ChatMessageOut(BaseModel):
    message: MessageContent
    session_id: str
    conversation_id: int


class ConversationOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    agent_id: Optional[int] = None
    status: str
    created_at: str
    updated_at: str


class AgentMessageIn(BaseModel):
    message: str


@router.post("/message", response_model=ChatMessageOut)
async def process_chat_message(
    body: ChatMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import ChatMessage as ChatMessageModel, Conversation
    from app.ws_manager import manager

    user_id = getattr(current_user, "id", None)
    session_id = body.session_id or f"session_{datetime.now(timezone.utc).timestamp()}_{user_id}"

    user_msg = ChatMessageModel(
        user_id=user_id,
        session_id=session_id,
        role="user",
        content=body.message,
    )
    db.add(user_msg)

    conversation = await db.execute(
        select(Conversation).where(Conversation.session_id == session_id)
    )
    conversation = conversation.scalar_one_or_none()
    if not conversation:
        conversation = Conversation(
            user_id=user_id,
            session_id=session_id,
            status="pending",
        )
        db.add(conversation)

    reply_text = body.message
    from app.ai.agent import get_ai_agent
    try:
        agent = get_ai_agent()
        result = await agent.process_message(body.message, user_id=user_id)
        reply_text = result
    except Exception:
        reply_text = f"I received your message about '{body.message[:50]}'. An agent will review our conversation shortly."

    assistant_msg = ChatMessageModel(
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        content=reply_text,
    )
    db.add(assistant_msg)
    await db.commit()

    await manager.broadcast_to_agents({"type": "new_pending", "message": f"New message from user #{user_id}"})

    return ChatMessageOut(
        message=MessageContent(
            id=str(assistant_msg.id),
            role="assistant",
            content=reply_text,
            created_at=assistant_msg.created_at.isoformat(),
        ),
        session_id=session_id,
        conversation_id=conversation.id,
    )


@router.get("/conversations", response_model=List[ConversationOut])
async def list_conversations(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import Conversation
    from app.models.user import User

    query = select(Conversation, User.name).join(User, Conversation.user_id == User.id)

    role = getattr(current_user, "role", "customer")
    if role == "customer":
        query = query.where(Conversation.user_id == current_user.id)
    elif role in ("admin", "agent"):
        if status_filter:
            query = query.where(Conversation.status == status_filter)
    else:
        query = query.where(Conversation.user_id == current_user.id)

    query = query.order_by(Conversation.updated_at.desc())
    result = await db.execute(query)
    rows = result.all()

    return [
        ConversationOut(
            id=conv.id,
            user_id=conv.user_id,
            user_name=user_name,
            agent_id=conv.agent_id,
            status=conv.status,
            created_at=conv.created_at.isoformat(),
            updated_at=conv.updated_at.isoformat(),
        )
        for conv, user_name in rows
    ]


@router.get("/conversations/{conv_id}/messages")
async def get_conversation_messages(
    conv_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import Conversation, ChatMessage as ChatMessageModel

    conv = await db.get(Conversation, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    role = getattr(current_user, "role", "customer")
    if role == "customer" and conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(ChatMessageModel)
        .where(ChatMessageModel.session_id == conv.session_id)
        .order_by(ChatMessageModel.created_at.asc())
    )
    messages = result.scalars().all()

    return [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.post("/conversations/{conv_id}/accept")
async def accept_conversation(
    conv_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import Conversation

    role = getattr(current_user, "role", "customer")
    if role not in ("admin", "agent"):
        raise HTTPException(status_code=403, detail="Only agents can accept conversations")

    conv = await db.get(Conversation, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.status != "pending":
        raise HTTPException(status_code=400, detail="Conversation is not pending")

    conv.agent_id = current_user.id
    conv.status = "active"
    await db.commit()

    from app.ws_manager import manager
    await manager.broadcast_to_agents({"type": "conversation_accepted", "conversation_id": conv_id})
    await manager.send_to_customer(conv.user_id, {"type": "conversation_accepted", "conversation_id": conv_id})

    return {"message": "Conversation accepted", "conversation_id": conv_id}


@router.post("/conversations/{conv_id}/close")
async def close_conversation(
    conv_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import Conversation

    conv = await db.get(Conversation, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    role = getattr(current_user, "role", "customer")
    if role == "customer" and conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if role in ("admin", "agent") and conv.agent_id != current_user.id and role != "admin":
        raise HTTPException(status_code=403, detail="Not your conversation")

    conv.status = "closed"
    await db.commit()
    return {"message": "Conversation closed"}


@router.post("/conversations/{conv_id}/message")
async def agent_send_message(
    conv_id: int,
    body: AgentMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import Conversation, ChatMessage as ChatMessageModel

    role = getattr(current_user, "role", "customer")
    if role not in ("admin", "agent"):
        raise HTTPException(status_code=403, detail="Only agents can send messages via this endpoint")

    conv = await db.get(Conversation, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.status != "active":
        raise HTTPException(status_code=400, detail="Conversation is not active")
    if role != "admin" and conv.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your conversation")

    msg = ChatMessageModel(
        user_id=current_user.id,
        session_id=conv.session_id,
        role="agent",
        content=body.message,
        agent_id=current_user.id,
    )
    db.add(msg)
    conv.updated_at = datetime.now(timezone.utc)
    await db.commit()

    from app.ws_manager import manager
    await manager.send_to_customer(conv.user_id, {"type": "new_message", "conversation_id": conv_id, "content": body.message})

    return {"id": str(msg.id), "role": "agent", "content": body.message, "created_at": msg.created_at.isoformat()}


@router.get("/notifications")
async def agent_notifications(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import Conversation

    role = getattr(current_user, "role", "customer")
    if role not in ("admin", "agent"):
        return {"pending_count": 0, "active_count": 0, "conversations": []}

    pending = await db.execute(
        select(Conversation).where(Conversation.status == "pending").order_by(Conversation.created_at.desc())
    )
    active = await db.execute(
        select(Conversation).where(
            and_(Conversation.status == "active", Conversation.agent_id == current_user.id)
        ).order_by(Conversation.updated_at.desc())
    )

    return {
        "pending_count": len(pending.scalars().all()),
        "active_count": len(active.scalars().all()),
    }


@router.get("/history/{user_id}")
async def get_chat_history(
    user_id: int,
    session_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.conversation import ChatMessage as ChatMessageModel

    query = select(ChatMessageModel).where(ChatMessageModel.user_id == user_id).order_by(ChatMessageModel.created_at.desc())

    if session_id:
        query = query.where(ChatMessageModel.session_id == session_id)

    query = query.limit(limit)
    result = await db.execute(query)
    messages = result.scalars().all()

    return [
        {
            "id": msg.id,
            "user_id": msg.user_id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]
