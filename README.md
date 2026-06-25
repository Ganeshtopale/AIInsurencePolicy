<<<<<<< HEAD
<<<<<<< HEAD
# Insurance Bazaar — AI Insurance Marketplace

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
- [Cyber Security](#cyber-security)
- [Deployment](#deployment)

## Overview

Insurance Bazaar connects customers with insurance policies through an AI-powered chatbot, real-time market comparison, and a seamless purchase flow. Agents manage leads via real-time WebSocket notifications, manage providers/policies through admin CRUD, and purchase policies on behalf of customers.

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
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React + Vite)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐  │
│  │   Pages   │  │Components│  │   Store   │  │   Services (Axios API)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────────┘  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTP/1.1 (proxied via Vite) + WebSocket
┌───────────────────────────────────┴─────────────────────────────────────┐
│                       Backend (FastAPI + Python 3.12)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐  │
│  │API Routes│  │ Services  │  │  Models   │  │   AI / ML Layer        │  │
│  │ (13 rtrs)│  │(auth,pay) │  │(SQLAlchm) │  │ (Agent,RAG,Tools,ML)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────────┘  │
│                                                                         │
│  ┌───────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │
│  │ WebSocket Mgr  │  │  ConnectionPool  │  │  Celery Background     │  │
│  │ (agent/cust)   │  │  (asyncpg)       │  │  Tasks (renewal, etc)  │  │
│  └───────────────┘  └──────────────────┘  └────────────────────────┘  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
       ┌─────────────────────────────┼─────────────────────────────┐
       │              │                              │             │
┌──────────┐  ┌───────────┐  ┌─────────────────┐  ┌──────────┐  ┌────────┐
│PostgreSQL │  │  Redis    │  │  OpenAI/Tavily   │  │   Files   │  │Razorpay│
│ +pgvector │  │(Cache+Q)  │  │  (External APIs) │  │ (Uploads) │  │(Pay)   │
└──────────┘  └───────────┘  └─────────────────┘  └──────────┘  └────────┘
```

## Project Structure

```
insurance-bazaar/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI entry point (WebSocket + HTTP)
│   │   ├── config.py                        # Pydantic settings
│   │   ├── database.py                      # SQLAlchemy async engine
│   │   ├── seed.py                          # Database seeder
│   │   ├── ws_manager.py                    # WebSocket ConnectionManager
│   │   ├── models/
│   │   │   ├── user.py                      # User model
│   │   │   ├── policy.py                    # Insurance policies
│   │   │   ├── provider.py                  # Insurance providers
│   │   │   ├── lead.py                      # Lead tracking
│   │   │   ├── purchase.py                  # Policy purchases
│   │   │   ├── payment.py                   # Payment transactions
│   │   │   ├── conversation.py              # Chat conversations
│   │   │   ├── job.py                       # Jobs & applications
│   │   │   └── task.py                      # Background tasks
│   │   ├── api/
│   │   │   ├── __init__.py                  # Router aggregator
│   │   │   ├── auth.py                      # Register, login, profile
│   │   │   ├── admin.py                     # Dashboard, users, policies, jobs
│   │   │   ├── admin_providers.py           # Provider CRUD
│   │   │   ├── chat.py                      # AI chatbot + conversation mgmt
│   │   │   ├── policies.py                  # Public policy listing
│   │   │   ├── leads.py                     # Lead management
│   │   │   ├── compare.py                   # Quote comparison
│   │   │   ├── checkout.py                  # Payments
│   │   │   ├── jobs.py                      # Public jobs + apply
│   │   │   ├── upload.py                    # File upload
│   │   │   ├── pages.py                     # Static page content
│   │   │   ├── home.py                      # Homepage data
│   │   │   └── user_profile.py              # Profile & purchases
│   │   ├── ai/
│   │   │   ├── agent.py                     # LangChain agent (singleton)
│   │   │   ├── rag/
│   │   │   │   ├── embeddings.py            # OpenAI embedding wrapper
│   │   │   │   ├── vector_store.py          # File-based vector store
│   │   │   │   ├── retriever.py             # Query → embed → search
│   │   │   │   └── ingestion.py             # MD → chunk → embed → store
│   │   │   ├── tools/
│   │   │   │   ├── web_search.py            # Tavily search
│   │   │   │   ├── calculator.py            # Premium calculator
│   │   │   │   └── policy_lookup.py         # DB policy search
│   │   │   └── prompts/
│   │   │       ├── chat.py                  # System prompt
│   │   │       ├── summary.py               # Conversation summary prompt
│   │   │       └── lead_scoring.py          # Lead scoring prompt
│   │   ├── ml/
│   │   │   ├── inference.py                 # Model inference
│   │   │   └── training/                    # Training scripts
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
│   │   │   ├── Home.tsx, Chat.tsx, Policies.tsx, Compare.tsx
│   │   │   ├── Checkout.tsx, Login.tsx, Dashboard.tsx
│   │   │   ├── ProfilePage.tsx, EditProfile.tsx
│   │   │   ├── AdminDashboard.tsx, AdminUsers.tsx
│   │   │   ├── AdminPolicies.tsx, AdminProviders.tsx
│   │   │   ├── AdminJobs.tsx, AdminJobApplications.tsx
│   │   │   ├── AgentDashboard.tsx, AgentChat.tsx
│   │   │   ├── Careers.tsx, Claims.tsx
│   │   │   ├── About.tsx, Blog.tsx, Contact.tsx
│   │   │   ├── FAQ.tsx, Privacy.tsx, Terms.tsx
│   │   │   ├── Press.tsx, Sitemap.tsx, Grievance.tsx
│   │   │   └── Partner.tsx, ForgotPassword.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx, Footer.tsx
│   │   │   ├── HeroSection.tsx, PolicyCard.tsx
│   │   │   ├── ChatBot.tsx, ComparisonTable.tsx
│   │   │   └── FileUpload.tsx, LeadCard.tsx
│   │   ├── store/index.ts                   # Zustand stores
│   │   ├── services/api.ts                  # Axios API client
│   │   └── types/index.ts                   # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   ├── nginx.conf                           # Production nginx
│   └── Dockerfile
├── backend/data/
│   ├── policy_documents/                    # RAG knowledge base (8 MD files)
│   └── vector_store/                        # Persisted embeddings
├── uploads/
├── .github/workflows/
│   ├── ci.yml                               # Lint, build, test
│   └── cd.yml                               # Docker build & push
├── docker-compose.yml
├── .env.example
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
pip install -r requirements.txt
```

Edit `backend/.env` with your database credentials and API keys, then:

```bash
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

This creates **13 insurance providers**, **5 users**, **3 sample leads**, and **12 sample policies**.

### Default Accounts

| Role     | Email                         | Password    |
|----------|-------------------------------|-------------|
| Admin    | `admin@insurancebazaar.app`   | `admin123`  |
| Agent    | `agent@insurancebazaar.app`   | `agent123`  |
| Customer | `rahul@example.com`           | `user123`   |
| Customer | `priya@example.com`           | `user123`   |
| Customer | `amit@example.com`            | `user123`   |

> **Admin login**: Use `admin` (username) or `admin@insurancebazaar.app` (email) with password `admin123`.

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (email / username / phone) |
| POST | `/api/auth/admin-login` | Admin login (username or email) |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Request OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats overview |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/{id}` | Update user |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/policies` | List all policies |
| POST | `/api/admin/policies` | Create policy |
| PUT | `/api/admin/policies/{id}` | Update policy |
| DELETE | `/api/admin/policies/{id}` | Delete policy |
| POST | `/api/admin/purchase-for-customer` | Agent purchases for customer |
| GET | `/api/admin/providers` | List providers |
| POST | `/api/admin/providers` | Create provider |
| PUT | `/api/admin/providers/{id}` | Update provider |
| DELETE | `/api/admin/providers/{id}` | Delete provider |
| GET | `/api/admin/jobs` | List jobs |
| GET | `/api/admin/job-applications` | List applications |
| PUT | `/api/admin/job-applications/{id}` | Update application status |
| POST | `/api/admin/create-admin` | Create admin account |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload image (JPEG/PNG/WebP, max 5MB) |

### Policies (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/policies` | List policies (filterable) |
| GET | `/api/policies/{id}` | Get policy details |
| POST | `/api/policies/compare` | Compare quotes |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message to AI advisor |
| GET | `/api/chat/conversations` | List conversations |
| GET | `/api/chat/conversations/{id}` | Get conversation messages |
| POST | `/api/chat/conversations/{id}/accept` | Agent accepts |
| POST | `/api/chat/conversations/{id}/close` | Close conversation |

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
| GET | `/api/jobs` | List active jobs |
| GET | `/api/jobs/{id}` | Get job details |
| POST | `/api/jobs/{id}/apply` | Submit application |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/seed` | Seed database |
| GET | `/api/home` | Homepage data |
| GET | `/api/pages/{name}` | Static page content |

## AI Features

### AI Insurance Advisor

LangChain + OpenAI GPT-3.5-turbo conversational agent with tools:

1. **Policy Lookup Tool** — Database queries for matching policies
2. **Calculator Tool** — Premium estimation
3. **Web Search Tool** — Live market data via Tavily

### Intelligent Query Routing

Before invoking tools, the agent classifies queries using keyword scoring + LLM fallback:

| Route | Trigger Keywords | Action |
|-------|-----------------|--------|
| `rag` | "explain", "coverage", "term insurance" | Retrieve from vector store |
| `policy_lookup` | "show policy", "find policy", "policies" | SQL query via PolicyLookupTool |
| `calculation` | "calculate", "premium", "estimate" | PremiumCalculator math engine |
| `web_search` | "latest", "market", "top plan" | Tavily API search |
| `general` | Default / no match | Pure LLM response |

### Fallback Chain

When OpenAI API is unavailable (e.g., quota exhausted), the chatbot degrades gracefully:

1. Returns any available context (policy lookup or calculation results) directly
2. Attempts regex-based policy DB lookup for insurance-related keywords
3. Displays an offline notice suggesting contact with a human agent

### RAG Pipeline

The RAG system uses a custom file-based vector store built with numpy and OpenAI embeddings (`text-embedding-ada-002`, 1536 dimensions).

**How it works:**

1. **Knowledge Base** — 8 markdown files in `backend/data/policy_documents/` covering: term life, health, motor, travel, critical illness, ULIPs, general insurance guide, and claims FAQ
2. **Chunking** — Documents are split into 500-char chunks with 100-char overlap
3. **Embedding** — Each chunk is embedded using OpenAI `text-embedding-ada-002`
4. **Storage** — Embeddings stored as numpy array (`.npy`) and documents as JSON
5. **Retrieval** — User query is embedded, cosine similarity computed, top-k results returned

**Data flow:**
```
Query → embed_text() → 1536-dim vector → cosine_similarity → top-k → format_for_context() → LLM
```

**Ingestion:** Run automatically with `POST /seed` (requires `OPENAI_API_KEY`). If key is not set or quota is exhausted, ingestion is skipped gracefully.

### Adding New Documents

Add markdown files to `backend/data/policy_documents/` and re-run seed. The ingestion pipeline detects new files, chunks them, generates embeddings, and appends to the existing vector store.

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
2. Builds & pushes **backend** Docker image
3. Builds & pushes **frontend** Docker image

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://postgres:***@localhost:5432/policybazar` | Database connection |
| `JWT_SECRET` | Yes | (set) | JWT signing key |
| `OPENAI_API_KEY` | No | — | GPT-3.5-turbo key |
| `TAVILY_API_KEY` | No | — | Market search key |
| `RAZORPAY_KEY_ID` | Yes | (test key) | Razorpay key |
| `RAZORPAY_KEY_SECRET` | Yes | (test secret) | Razorpay secret |
| `GOOGLE_CLIENT_ID` | Yes | (set) | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Yes | (set) | Google OAuth |
| `TWILIO_ACCOUNT_SID` | Yes | (set) | Twilio SMS |
| `TWILIO_AUTH_TOKEN` | Yes | (set) | Twilio auth |
| `CORS_ORIGINS` | No | localhost origins | Allowed origins |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `/api` | Backend API base URL |

## Cyber Security

As a **finance-grade insurance platform** handling sensitive personal and payment data, Insurance Bazaar implements the following security measures:

### Authentication & Authorization

| Layer | Implementation |
|-------|---------------|
| Password Hashing | bcrypt (via passlib) — industry standard for credential storage |
| JWT Tokens | HS256-signed access tokens with configurable expiry (default 24h) |
| Role-Based Access Control (RBAC) | Three tiers: `admin`, `agent`, `customer` — enforced on every protected route |
| Admin Login | Separate endpoint with hardcoded + database-backed admin credentials |
| OTP Verification | Time-limited OTP for password reset flow |

### API Security

| Measure | Implementation |
|---------|---------------|
| CORS | Whitelist-based origin restriction (configurable via `CORS_ORIGINS`) |
| Input Validation | Pydantic v2 schemas — automatic type coercion, rejection of malformed payloads |
| SQL Injection | Prevented by SQLAlchemy ORM parameterized queries (no raw SQL concatenation) |
| Rate Limiting | Endpoints protected against brute force (configurable) |

### Data Protection

| Category | Practice |
|----------|----------|
| Personal Data | User profiles (age, city, income, phone) stored with minimal collection principle |
| Payment Data | All payments processed through **Razorpay** — Insurance Bazaar never stores credit card numbers, UPI details, or bank account info |
| Passwords | Never stored in plaintext — bcrypt hashed with salt |
| Secrets & Keys | All API keys, tokens, and secrets loaded from environment variables — never hardcoded in source code |
| File Uploads | Image uploads restricted to JPEG/PNG/WebP, max 5MB, validated server-side |

### Infrastructure Security

| Measure | Implementation |
|---------|---------------|
| HTTPS | Enforce TLS in production behind reverse proxy |
| Docker Isolation | Services run in isolated containers with bridge networking |
| Health Checks | Container health checks prevent routing to unhealthy instances |
| Logging | JSON-file logging with rotation (max 10MB per file, 3 rotations) |

### Code Security Practices

| Practice | Implementation |
|----------|---------------|
| Dependency Scanning | `requirements.txt` and `package.json` versions tracked |
| Type Safety | Full TypeScript frontend + Python type hints + mypy checks |
| Linting | Ruff (Python) for security-focused lint rules |
| CI/CD Guards | Pipeline fails on type errors, lint violations, or test failures |

### Security Checklist for Production

Before deploying to production:

- [ ] Rotate `JWT_SECRET` to a strong, unique value (min 32 chars)
- [ ] Replace test Razorpay keys with **live production keys**
- [ ] Replace test Twilio credentials with production credentials
- [ ] Set `CORS_ORIGINS` to your actual domain only
- [ ] Enable HTTPS behind reverse proxy (nginx/caddy)
- [ ] Restrict database access to application IP only
- [ ] Enable database encryption at rest
- [ ] Set up AWS S3 with **signed URLs** for document access
- [ ] Configure WebSocket to use WSS (secure WebSocket)
- [ ] Enable API rate limiting for auth endpoints
- [ ] Set up **fail2ban** or similar for brute-force protection
- [ ] Run regular dependency audits (`pip audit`, `npm audit`)
- [ ] Implement database backup strategy with encryption
- [ ] Set up monitoring & alerting (uptime, error rates, suspicious activity)

## Deployment

```bash
docker compose up --build -d
```

- Frontend served on port 80 (nginx)
- Backend API on port 8000
- PostgreSQL on port 5432
- Redis on port 6379

### Production Considerations

- Rotate all secrets and use environment-specific keys
- Enable HTTPS behind reverse proxy
- Configure AWS S3 with signed URLs for document storage
- Set `OPENAI_API_KEY` and `TAVILY_API_KEY` for full AI features
- Set up proper WebSocket secure (WSS) proxy in nginx
- Enable database automated backups
- Monitor application with logging and alerting
=======
# policybazar
>>>>>>> 4a70a100fef1b799512f2987371f34a8089d6355
=======
# InsurencePolicy
>>>>>>> c1519994b211c842640ff156fe5ec266a32885a2
