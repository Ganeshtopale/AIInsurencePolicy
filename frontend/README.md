# Insurance Bazaar — Frontend

React 18 + TypeScript frontend for the AI-powered insurance marketplace.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion 10 | Page & component animations |
| Zustand | Lightweight state management |
| React Router v6 | Client-side routing (30+ pages) |
| Axios | HTTP client with interceptors |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| React Markdown | Markdown rendering in chat |
| Razorpay SDK | Payment gateway integration |

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                   # App entry point
│   ├── App.tsx                    # Routes (30+ pages), Navbar, Footer
│   ├── index.css                  # Tailwind base + custom styles
│   ├── pages/
│   │   ├── Home.tsx               # Landing page
│   │   ├── Chat.tsx               # AI + agent chat interface
│   │   ├── Policies.tsx           # Browse & filter policies
│   │   ├── Compare.tsx            # Side-by-side policy comparison
│   │   ├── Checkout.tsx           # Razorpay payment flow
│   │   ├── Login.tsx              # Auth (email/phone/Google)
│   │   ├── Dashboard.tsx          # Customer dashboard
│   │   ├── ProfilePage.tsx        # View profile
│   │   ├── EditProfile.tsx        # Edit profile with file upload
│   │   ├── PurchaseHistory.tsx    # Purchased policies
│   │   ├── AdminDashboard.tsx     # Admin stats & provider quick-create
│   │   ├── AdminUsers.tsx         # User management
│   │   ├── AdminPolicies.tsx      # Policy CRUD
│   │   ├── AdminProviders.tsx     # Provider CRUD
│   │   ├── AdminJobs.tsx          # Job listing management
│   │   ├── AdminJobApplications.tsx # Application review
│   │   ├── AgentDashboard.tsx     # Agent conversation stats
│   │   ├── AgentChat.tsx          # Agent chat (pending/active/history)
│   │   ├── Careers.tsx            # Job listings & apply
│   │   ├── Claims.tsx             # Claims page
│   │   ├── ForgotPassword.tsx     # Password reset flow
│   │   └── Static pages: About, Blog, Contact, FAQ, Privacy,
│   │          Terms, Press, Sitemap, Grievance, Partner
│   ├── components/
│   │   ├── Navbar.tsx             # Responsive nav with role-based links
│   │   ├── Footer.tsx             # Site footer
│   │   ├── HeroSection.tsx        # Homepage hero
│   │   ├── PolicyCard.tsx         # Policy listing card
│   │   ├── ProductCard.tsx        # Product display card
│   │   ├── LeadCard.tsx           # Lead display card
│   │   ├── ComparisonTable.tsx    # Policy comparison table
│   │   ├── ChatBot.tsx            # Chat message components
│   │   ├── FileUpload.tsx         # Reusable file uploader
│   │   └── ApplicationStatusStepper.tsx
│   ├── services/api.ts            # Axios client + all API functions
│   ├── store/index.ts             # Zustand stores (auth, chat)
│   ├── hooks/useChat.ts           # Chat WebSocket hook
│   └── types/
│       ├── index.ts               # TypeScript interfaces
│       └── framer-motion.d.ts     # Framer Motion type declarations
├── package.json
├── vite.config.ts                 # Vite config + API proxy
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json / tsconfig.node.json
├── nginx.conf                     # Production nginx config
├── Dockerfile
└── index.html
```

## Setup

### Prerequisites
- Node.js 18+

### Local Development

```bash
cd frontend
npm install
npm run dev
```

Frontend at `http://localhost:5173`. API requests proxy to `http://localhost:8000` via Vite.

### Production Build

```bash
npm run build
npm run preview
```

## Key Features

### Authentication
- Login via email/username/phone + password
- Google OAuth with `@react-oauth/google`
- Admin-specific login endpoint
- Token stored in `sessionStorage` (tab-isolated sessions)
- Auto profile refresh on page load

### Chat System
- Dual-mode chat: AI advisor (LangChain) + human agents
- Real-time WebSocket for agent messages
- Policy recommendation cards rendered inline
- Suggested questions for quick start
- Edit profile modal within chat

### Agent Interface
- Three-tab layout: Pending / Active / History
- Real-time WebSocket notifications for new conversations
- Accept/close conversations
- Buy policy on behalf of customer during active chat

### Admin Panel
- Dashboard with platform-wide stats
- User management (edit role, activate/deactivate, delete)
- Full CRUD for providers & policies
- Job posting management
- Application review with resume download

### Policy Comparison
- Side-by-side comparison table
- Filter by type, provider, coverage range
- Provider logos and ratings displayed

### File Upload
- Reusable `FileUpload` component with preview
- Upload profile pictures & provider logos
- Accepted: JPEG/PNG/WebP, max 5MB

## Routing

All routes defined in `App.tsx` with lazy loading via `React.lazy` + `Suspense`.

| Route | Page | Access |
|-------|------|--------|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/policies` | Browse Policies | Public |
| `/compare` | Compare | Public |
| `/chat` | AI + Agent Chat | Customer |
| `/dashboard` | Customer Dashboard | Customer |
| `/checkout` | Payment | Customer |
| `/profile` | Profile | Customer |
| `/admin` | Admin Dashboard | Admin/Agent |
| `/admin/users` | User Mgmt | Admin |
| `/admin/policies` | Policy Mgmt | Admin/Agent |
| `/admin/providers` | Provider Mgmt | Admin/Agent |
| `/agent` | Agent Dashboard | Agent |
| `/agent/chat` | Agent Chat | Agent |
| `/careers` | Job Listings | Public |
| `/about`, `/contact`, `/faq`, etc. | Static Pages | Public |

## Docker

```bash
# Production build served via nginx on port 80
docker build -t pb-frontend .
docker run -p 80:80 pb-frontend
```
