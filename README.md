# PolicyBazar — AI Insurance Marketplace

An AI-powered insurance comparison and policy recommendation platform built with React, FastAPI, PostgreSQL, LangChain, and real-time WebSocket chat.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Seed Data](#seed-data)
- [API Documentation](#api-documentation)
- [AI Features](#ai-features)
- [RAG Ingestion Pipeline](#rag-ingestion-pipeline)
- [ML Model](#ml-model)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)

## Overview

PolicyBazar connects customers with insurance policies through an AI-powered chatbot, real-time market comparison, and a seamless purchase flow. Agents manage leads via real-time WebSocket notifications, manage providers/policies through admin CRUD, and purchase policies on behalf of customers.

**For customers:** Compare policies, chat with an AI advisor, estimate premiums, complete purchases, and get real-time agent assistance.

**For agents:** Real-time WebSocket notifications for pending conversations, manage providers and policies, purchase policies on behalf of customers, view conversation history.

**For admins:** Full dashboard with stats, user management, provider CRUD, policy CRUD, job management, and application reviews.

## Features

### Customer Features

| Feature | Description |
|---------|-------------|
| AI Insurance Advisor Chatbot | Conversational UI powered by LangChain + GPT-3.5-turbo |
| Policy Comparison Engine | Side-by-side comparison of coverage, premiums, and ratings |
| Live Market Comparison | Real-time pricing from multiple providers |
| Smart Checkout | Payment flow |
| Policy Management | View and filter purchased policies |
| Google Login | One-click authentication with Google OAuth |
| Career Applications | Browse jobs and apply with resume upload |
| Profile Management | Edit name, phone, profile picture, age, city, income, family size |
| Real-time Agent Chat | Chat with human agents via WebSocket |
| File Upload | Upload profile pictures from local machine (JPEG/PNG/WebP) |

### Agent Features

| Feature | Description |
|---------|-------------|
| Agent Dashboard | Pending/active conversation counts, recent conversations |
| Real-time Notifications | WebSocket alerts for new customer messages |
| Conversation Management | Accept, chat, close conversations with customers |
| Conversation History | Browse closed conversations (never deleted) |
| Provider Management | Full CRUD for insurance providers |
| Policy Management | Create/edit/delete policies linked to providers |
| Purchase on Behalf | Buy a policy for a customer during chat |
| Customer List | View and manage customers |

### Admin Features

| Feature | Description |
|---------|-------------|
| Admin Dashboard | Stats overview (users, policies, providers, purchases, leads) |
| User Management | View, edit, activate/deactivate/delete users |
| Provider Management | Full CRUD with file upload for logos |
| Policy Management | Full CRUD linked to providers |
| Job Posting Management | Create, edit, open/close job listings |
| Application Review | View applications, download resumes, update status |
| Admin Account Creation | Create additional admin accounts from dashboard |

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Utility-first Styling |
| Framer Motion | Animations |
| Zustand | State Management |
| React Router v6 | Client-side Routing |
| Axios | HTTP Client |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | Async REST API |
| Python 3.12 | Backend Logic |
| SQLAlchemy 2.0 | Async ORM |
| Pydantic v2 | Validation |
| Celery | Task Queue |
| Redis | Message Broker & Cache |
| Razorpay | Payment Processing |
| Twilio | SMS Notifications |

### AI & ML

| Technology | Purpose |
|------------|---------|
| OpenAI GPT-3.5-turbo | Chat Completion |
| LangChain | AI Agent Orchestration |
| Tavily Search API | Live Market Data |
| XGBoost | Policy Prediction |
| scikit-learn | ML Pipeline |
| pandas / numpy | Data Processing |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL + pgvector | Primary Database |
| Redis | Cache & Celery Broker |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │   Pages   │  │Components│  │   Store   │  │   Services (API)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ HTTP (proxied via Vite) + WebSocket
┌──────────────────────────────────┴──────────────────────────────────┐
│                     Backend (FastAPI + Python 3.12)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │API Routes│  │ Services  │  │  Models   │  │   AI / ML Layer    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘  │
│                                                                     │
│  ┌───────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │ WebSocket Mgr  │  │  ConnectionPool  │  │  Background Tasks  │  │
│  └───────────────┘  └──────────────────┘  └────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
      ┌──────────────────────────────┼──────────────────────────────┐
      │              │                              │              │
┌───────┐  ┌───────────┐  ┌─────────────────┐  ┌───────────┐  ┌───────┐
│PostgreSQL│ │  Redis    │  │  OpenAI / Tavily │  │   Files   │  │Razorpay│
│+pgvector │ │(Cache+Q)  │  │  (External API)  │  │ (Uploads) │  │(Pay)   │
└─────────┘  └───────────┘  └─────────────────┘  └───────────┘  └───────┘
```

## Project Structure

```
policy-bazar/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI entry point (WebSocket + HTTP)
│   │   ├── config.py                        # Pydantic settings
│   │   ├── database.py                      # SQLAlchemy async engine
│   │   ├── seed.py                          # Database seeder (providers, users, leads)
│   │   ├── ws_manager.py                    # WebSocket ConnectionManager
│   │   ├── models/
│   │   │   ├── user.py                      # User (with age, city, income, family_size)
│   │   │   ├── policy.py                    # Insurance policies (linked to providers)
│   │   │   ├── provider.py                  # Insurance providers
│   │   │   ├── lead.py                      # Lead tracking
│   │   │   ├── purchase.py                  # Policy purchases
│   │   │   ├── payment.py                   # Payment transactions
│   │   │   ├── conversation.py              # Chat conversations
│   │   │   ├── job.py                       # Jobs & applications
│   │   │   └── task.py                      # Background tasks
│   │   ├── api/
│   │   │   ├── __init__.py                  # Router aggregator
│   │   │   ├── auth.py                      # Register, login, profile (extended fields)
│   │   │   ├── admin.py                     # Dashboard, users, policies (with provider_id), jobs, customers
│   │   │   ├── admin_providers.py           # Provider CRUD (admin + agent)
│   │   │   ├── chat.py                      # AI chatbot + conversation management
│   │   │   ├── policies.py                  # Public policy listing (with provider info)
│   │   │   ├── leads.py                     # Lead management
│   │   │   ├── compare.py                   # Quote comparison
│   │   │   ├── checkout.py                  # Payments
│   │   │   ├── jobs.py                      # Public jobs + apply
│   │   │   ├── upload.py                    # File upload endpoint
│   │   │   ├── pages.py                     # Static page content
│   │   │   ├── home.py                      # Homepage data
│   │   │   └── user_profile.py              # Profile & purchases
│   │   ├── ai/
│   │   │   ├── agent.py                     # LangChain agent (singleton factory)
│   │   │   ├── rag/                         # RAG pipeline
│   │   │   │   ├── embeddings.py            # OpenAI embedding wrapper
│   │   │   │   ├── vector_store.py          # In-memory + numpy + file persistence
│   │   │   │   ├── retriever.py             # Query → embed → search → format
│   │   │   │   └── ingestion.py             # Load MD → chunk → embed → store
│   │   │   ├── tools/                       # LangChain tools
│   │   │   │   ├── web_search.py
│   │   │   │   ├── calculator.py
│   │   │   │   └── policy_lookup.py
│   │   │   └── prompts/                     # LLM prompts
│   │   ├── ml/
│   │   │   ├── inference.py
│   │   │   └── training/
│   │   ├── workflows/                       # Celery tasks
│   │   │   ├── renewal.py
│   │   │   ├── payment.py
│   │   │   └── inactive_user.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       ├── payment_service.py
│   │       ├── email_service.py
│   │       ├── twilio_service.py
│   │       └── lead_scoring.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                          # Routes (30+ pages)
│   │   ├── pages/
│   │   │   ├── Home.tsx                     # Landing page
│   │   │   ├── Chat.tsx                     # AI advisor + real-time agent chat
│   │   │   ├── AgentChat.tsx                # Agent conversation hub (Pending/Active/History)
│   │   │   ├── Compare.tsx                  # Policy comparison
│   │   │   ├── Checkout.tsx                 # Checkout flow
│   │   │   ├── Policies.tsx                 # Policy listing
│   │   │   ├── Login.tsx                    # Login / Register / Admin Login
│   │   │   ├── Dashboard.tsx               # Customer dashboard
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── EditProfile.tsx              # Profile edit (pic, age, city, income, family)
│   │   │   ├── ChangePassword.tsx
│   │   │   ├── PurchaseHistory.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── AdminDashboard.tsx           # Admin overview + providers table
│   │   │   ├── AdminUsers.tsx               # User management (with delete)
│   │   │   ├── AdminPolicies.tsx            # Policy CRUD (linked to providers)
│   │   │   ├── AdminProviders.tsx           # Provider CRUD
│   │   │   ├── AdminJobs.tsx                # Job postings CRUD
│   │   │   ├── AdminJobApplications.tsx     # Application review
│   │   │   ├── AgentDashboard.tsx           # Agent stats dashboard
│   │   │   ├── Careers.tsx                  # Dynamic job listing + apply
│   │   │   ├── About.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── Partner.tsx
│   │   │   ├── Press.tsx
│   │   │   ├── Sitemap.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Grievance.tsx
│   │   │   ├── Claims.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Privacy.tsx
│   │   │   └── Terms.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── PolicyCard.tsx               # Shows provider logo
│   │   │   ├── ChatBot.tsx
│   │   │   ├── ComparisonTable.tsx          # Shows provider logos
│   │   │   ├── FileUpload.tsx               # Reusable file upload with preview
│   │   │   └── LeadCard.tsx
│   │   ├── store/index.ts                   # Zustand stores
│   │   ├── services/api.ts                  # Axios API client
│   │   └── types/index.ts                   # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── nginx.conf                           # Production nginx
│   ├── Dockerfile
│   └── .env
├── backend/data/
│   ├── policy_documents/                    # Markdown knowledge base for RAG (8 files)
│   └── vector_store/                        # Persisted embeddings (numpy + JSON)
├── uploads/                                 # Uploaded images
├── .github/workflows/
│   ├── ci.yml                               # Backend lint, frontend build, tests
│   └── cd.yml                               # Docker build & push to GHCR
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (or Docker)
- Redis (or Docker)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Edit `backend/.env` with your database credentials and API keys, then:

```bash
# Start the development server
uvicorn app.main:app --reload --port 8000
```

API at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend at `http://localhost:5173`. API requests proxy to backend via Vite.

### Docker Setup (Full Stack)

```bash
docker compose up --build
```

This starts postgres, redis, backend (8000), celery worker, and frontend (80).

## Seed Data

After starting the backend, populate sample data:

```bash
curl -X POST http://localhost:8000/seed
```

This creates **13 insurance providers**, **5 users**, and **3 sample leads**. Policies are created dynamically via the admin panel (not seeded).

### Default Accounts

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | `admin@policybazar.com`  | `admin123`  |
| Agent    | `agent@policybazar.com`  | `agent123`  |
| Customer | `rahul@example.com`      | `user123`   |
| Customer | `priya@example.com`      | `user123`   |
| Customer | `amit@example.com`       | `user123`   |

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (email / username / phone) |
| POST | `/api/auth/admin-login` | Admin login (hardcoded + DB) |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile (name, phone, profile_pic, age, city, income, family_size) |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Request OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats overview (users, policies, providers, purchases, leads) |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/{id}` | Update user (role, active) |
| DELETE | `/api/admin/users/{id}` | Delete user (cascades leads, conversations, purchases) |
| GET | `/api/admin/customers` | List customers (admin + agent) |
| GET | `/api/admin/policies` | List all policies (with provider info) |
| POST | `/api/admin/policies` | Create policy (with provider_id) |
| PUT | `/api/admin/policies/{id}` | Update policy |
| DELETE | `/api/admin/policies/{id}` | Delete policy |
| POST | `/api/admin/purchase-for-customer` | Agent purchases policy for customer |
| GET | `/api/admin/providers` | List all providers |
| POST | `/api/admin/providers` | Create provider |
| PUT | `/api/admin/providers/{id}` | Update provider |
| DELETE | `/api/admin/providers/{id}` | Delete provider (blocked if has policies) |
| GET | `/api/admin/jobs` | List jobs with application count |
| GET | `/api/admin/job-applications` | List all applications |
| PUT | `/api/admin/job-applications/{id}` | Update application status |
| POST | `/api/admin/create-admin` | Create new admin account |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload image (JPEG/PNG/WebP, max 5MB) |

### Policies (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/policies` | List policies (filterable by type, provider, coverage) |
| GET | `/api/policies/{id}` | Get policy details |
| POST | `/api/policies/compare` | Compare quotes |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message to AI advisor |
| GET | `/api/chat/conversations` | List conversations (customer or agent) |
| GET | `/api/chat/conversations/{id}` | Get conversation details |
| POST | `/api/chat/conversations/{id}/accept` | Agent accepts conversation |
| POST | `/api/chat/conversations/{id}/close` | Close conversation (soft, status=closed) |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `ws://host:8000/ws/agent/{user_id}` | Agent real-time notifications |
| `ws://host:8000/ws/customer/{user_id}` | Customer real-time messages |

### Checkout

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout/create-order` | Create order |
| POST | `/api/checkout/verify` | Verify payment signature |

### Jobs (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List active job openings |
| GET | `/api/jobs/{id}` | Get job details |
| POST | `/api/jobs/{id}/apply` | Submit application with resume |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/seed` | Seed database with sample data |
| GET | `/api/home` | Homepage data |
| GET | `/api/pages/{name}` | Static page content |

## AI Features

### AI Insurance Advisor

LangChain + OpenAI GPT-3.5-turbo conversational agent with tools:

1. **Policy Lookup Tool** — Database queries for matching policies (joins with providers)
2. **Calculator Tool** — Premium estimation
3. **Web Search Tool** — Live market data via Tavily

### RAG Pipeline

The RAG system uses a custom file-based vector store (not pgvector) built with numpy and OpenAI embeddings (`text-embedding-ada-002`, 1536 dimensions).

**How it works:**

1. **Knowledge Base** — 8 markdown files in `backend/data/policy_documents/` covering: term life, health, motor, travel, critical illness, ULIPs, general insurance guide, and claims FAQ
2. **Chunking** — `RecursiveCharacterTextSplitter` splits documents into 500-char chunks with 100-char overlap
3. **Embedding** — Each chunk is embedded using OpenAI `text-embedding-ada-002` via `embeddings.py`
4. **Storage** — Embeddings stored as numpy array (`.npy`) and documents as JSON in `backend/data/vector_store/`
5. **Retrieval** — User query is embedded, cosine similarity computed against all stored embeddings via `sklearn.metrics.pairwise.cosine_similarity`, top-k results returned

**Data flow:**
```
Query → embed_text() → 1536-dim vector → cosine_similarity → top-k → format_for_context() → LLM
```

**Ingestion:** Run automatically with `POST /seed` (requires `OPENAI_API_KEY`). If key is not set, ingestion is skipped gracefully.

### Intelligent Query Routing

Before invoking tools, the agent classifies queries using keyword scoring + LLM fallback:

| Route | Trigger Keywords | Action |
|-------|-----------------|--------|
| `rag` | "explain", "coverage", "term insurance" | Retrieve from vector store |
| `policy_lookup` | "show policy", "find policy", "policies" | SQL query via PolicyLookupTool |
| `calculation` | "calculate", "premium", "estimate" | PremiumCalculator math engine |
| `web_search` | "latest", "market", "top plan" | Tavily API search |
| `general` | Default / no match | Pure LLM response |

## RAG Ingestion Pipeline

The vector store is populated with insurance domain knowledge during the seed process.

### Prerequisites

Set `OPENAI_API_KEY` in `backend/.env` to enable embedding generation.

### Running Ingestion

```bash
# Ingestion runs automatically as part of seed
curl -X POST http://localhost:8000/seed
```

Or run standalone:
```bash
cd backend
python -c "
import asyncio
from app.ai.rag.vector_store import VectorStore
from app.ai.rag.ingestion import run_ingestion
asyncio.run(run_ingestion(VectorStore()))
"
```

### Adding New Documents

Add markdown files to `backend/data/policy_documents/` and re-run seed. The ingestion pipeline:
1. Detects new files automatically
2. Chunks them with 500-char window and 100-char overlap
3. Generates embeddings via OpenAI
4. Appends to existing vector store
5. Persists embeddings to disk (numpy `.npy` + JSON)

### Document Format

Write plain markdown with headings and bullet points. The chunker preserves semantic boundaries using natural separators (`\n\n`, `\n`, `.`, ` `). Each chunk's metadata includes the source document index for traceability.

## ML Model

### XGBoost Policy Prediction

Predicts best policy fit using customer age, income, coverage amount, risk tolerance, and historical preferences.

### Lead Scoring

Ensemble scoring (0-100) based on engagement, budget match, coverage fit, intent signals, and recency.

## CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and delivery.

### CI (`ci.yml`)
Triggered on push/PR to `main` and `develop` branches:

| Job | What it does |
|-----|-------------|
| `backend-lint` | Ruff linter + mypy type check |
| `frontend-lint` | TypeScript check + Vite production build |
| `backend-test` | Runs pytest against a temporary PostgreSQL container |
| `deploy-check` | Gate check that all prior jobs passed on main |

### CD (`cd.yml`)
Triggered on push to `main` or version tags (`v*`):

1. Logs in to **GitHub Container Registry** (ghcr.io)
2. Builds & pushes **backend** Docker image with tags: `main`, `semver`, short SHA
3. Builds & pushes **frontend** Docker image with same tagging strategy

### Local Docker Build

```bash
docker compose build
docker compose up -d
# Seed the database
curl -X POST http://localhost:8000/seed
```

The backend container mounts `./backend/data:/app/data` so the vector store persists across restarts.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://postgres:Welcome%402026@localhost:5432/policybazar` | Database connection |
| `JWT_SECRET` | Yes | (set) | JWT signing key |
| `JWT_ALGORITHM` | No | `HS256` | Signing algorithm |
| `JWT_EXPIRATION_HOURS` | No | `24` | Token expiry |
| `OPENAI_API_KEY` | No | — | GPT-3.5-turbo key |
| `TAVILY_API_KEY` | No | — | Market search key |
| `RAZORPAY_KEY_ID` | Yes | (test key) | Razorpay test key |
| `RAZORPAY_KEY_SECRET` | Yes | (test secret) | Razorpay test secret |
| `GOOGLE_CLIENT_ID` | Yes | (set) | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | (set) | Google OAuth secret |
| `TWILIO_ACCOUNT_SID` | Yes | (set) | Twilio SMS SID |
| `TWILIO_AUTH_TOKEN` | Yes | (set) | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes | (set) | Twilio sender number |
| `CORS_ORIGINS` | No | `["http://localhost:3000","http://localhost:5173"]` | Allowed origins |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `/api` | Backend API base URL |

## Deployment

```bash
docker compose up --build -d
```

- Frontend served on port 80 (nginx)
- Backend API on port 8000
- PostgreSQL on port 5432
- Redis on port 6379

### Production Considerations

- Rotate `JWT_SECRET` to a strong unique value
- Use real Razorpay keys (not test keys)
- Set `CORS_ORIGINS` to your domain
- Enable HTTPS behind reverse proxy
- Configure AWS S3 for document storage
- Set `OPENAI_API_KEY` and `TAVILY_API_KEY` for AI features
- Set up proper WebSocket proxy in nginx

## Security

- **JWT** access + refresh tokens, bcrypt password hashing
- **CORS** restricted to trusted origins
- **Input validation** via Pydantic v2
- **SQL injection** prevented by SQLAlchemy ORM
- **Role-based access** — admin, agent, customer routes protected by JWT + role check
- **Secrets** loaded from environment, never hardcoded in code

---

![alt text](image-3.png)

![alt text](image-4.png)

![alt text](image-5.png)
