# Insurance Bazaar — Backend API

FastAPI-based async REST API powering the Insurance Bazaar AI insurance marketplace.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| FastAPI | Async REST API framework |
| Python 3.11+ | Backend logic |
| SQLAlchemy 2.0 | Async ORM with PostgreSQL |
| Pydantic v2 | Request/response validation |
| Alembic | Database migrations |
| Celery | Background task processing |
| Redis | Message broker & cache |
| Razorpay | Payment processing |
| Twilio | SMS notifications |
| OpenAI GPT-3.5-turbo | AI chatbot |
| LangChain | AI agent orchestration |
| Tavily Search API | Live market data |
| XGBoost | Policy prediction ML model |

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI entry, WebSocket, CORS, lifespan
│   ├── config.py               # Pydantic Settings (env-based)
│   ├── database.py             # SQLAlchemy async engine & session
│   ├── seed.py                 # Database seeder (providers, users, leads)
│   ├── worker.py               # Celery app definition
│   ├── ws_manager.py           # WebSocket ConnectionManager
│   ├── api/                    # Route handlers
│   │   ├── auth.py             # Register, login, Google OAuth, password reset
│   │   ├── admin.py            # Dashboard stats, user mgmt, policy mgmt
│   │   ├── admin_providers.py  # Provider CRUD
│   │   ├── chat.py             # AI chatbot + conversation mgmt
│   │   ├── policies.py         # Public policy listing & comparison
│   │   ├── leads.py            # Lead management
│   │   ├── compare.py          # Quote comparison
│   │   ├── checkout.py         # Razorpay payment flow
│   │   ├── jobs.py             # Job listings & applications
│   │   ├── upload.py           # File upload (images)
│   │   ├── pages.py            # Static page content
│   │   ├── home.py             # Homepage data
│   │   └── user_profile.py     # Profile & purchase history
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py, policy.py, provider.py, lead.py
│   │   ├── purchase.py, payment.py, conversation.py
│   │   ├── job.py, task.py
│   ├── schemas/                # Pydantic request/response schemas
│   ├── ai/                     # AI/ML layer
│   │   ├── agent.py            # LangChain agent (singleton factory)
│   │   ├── rag/                # RAG pipeline (embeddings, vector store, retriever, ingestion)
│   │   ├── tools/              # Web search, calculator, policy lookup
│   │   └── prompts/            # System prompts, summary, lead scoring
│   ├── ml/                     # ML model
│   │   ├── inference.py        # XGBoost policy prediction
│   │   └── training/           # Training scripts
│   ├── services/               # Business logic
│   │   ├── auth_service.py, payment_service.py
│   │   ├── email_service.py, twilio_service.py
│   │   └── lead_scoring.py
│   └── workflows/              # Celery background tasks
│       ├── renewal.py, payment.py, inactive_user.py
├── data/
│   ├── policy_documents/       # RAG knowledge base (markdown)
│   └── vector_store/           # Persisted embeddings
├── alembic/                    # Database migrations
├── requirements.txt
├── Dockerfile
└── .env
```

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 16+
- Redis

### Local Development

```bash
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

Configure `backend/.env` (see `.env` for reference), then:

```bash
uvicorn app.main:app --reload --port 8000
```

API at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Seed Database

```bash
curl -X POST http://localhost:8000/seed
```

Creates 13 providers, 5 users (admin/agent/3 customers), and 3 sample leads.

## Key API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login (email/username/phone) |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/forgot-password` | Request OTP |
| POST | `/api/auth/reset-password` | Reset with OTP |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform stats |
| GET | `/api/admin/users` | List users |
| PUT/DELETE | `/api/admin/users/{id}` | Update/delete user |
| CRUD | `/api/admin/policies` | Policy management |
| CRUD | `/api/admin/providers` | Provider management |

### Chat & WebSocket
| Endpoint | Description |
|----------|-------------|
| POST | `/api/chat/message` | AI advisor message |
| GET | `/api/chat/conversations` | List conversations |
| `ws://host:8000/ws/agent/{user_id}` | Agent real-time |
| `ws://host:8000/ws/customer/{user_id}` | Customer real-time |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout/create-order` | Razorpay order |
| POST | `/api/checkout/verify` | Verify signature |

## AI Features

- **LangChain Agent** with GPT-3.5-turbo, tools for policy lookup, premium calculation, web search
- **RAG Pipeline** using OpenAI embeddings + file-based vector store (numpy)
- **Intelligent Query Routing** — classifies queries as RAG, policy lookup, calculation, web search, or general
- **Graceful Fallback** — when OpenAI is unavailable, returns DB results directly

## ML Model

XGBoost classifier for policy prediction based on customer profile (age, income, coverage, risk tolerance). Lead scoring uses ensemble scoring (0-100).

## Docker

```bash
docker compose up --build
```

Runs with postgres, redis, backend (8000), celery worker, and frontend (80).
