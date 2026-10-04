# OTP Shield — Enterprise Multi-Channel OTP & Verification Service

An enterprise-ready, scalable, dynamic, and optimized Next.js frontend & API layer for one-time password (OTP) delivery and identity verification across **SMS**, **WhatsApp**, and **Email** channels.

---

## 🚀 Key Architectural Highlights

- **Multi-Gateway Failover**: Cascading routing between Twilio, AWS SNS, SendGrid, and Meta WhatsApp Cloud API with automatic degradation failover.
- **Sub-200ms Latency**: Low-overhead edge architecture with correlation tracing (`x-request-id`) and request timing (`x-response-time`).
- **Cryptographic Security**: HMAC-signed verification tokens with brute-force lockouts (3 attempts max) and strict TTL expiration (300s).
- **Zero Plain-Text Token Storage**: Tokens are securely hashed and compared in-memory.
- **Production Folder Structure**: Strict separation of concerns (Atomic UI components, layout shells, domain hooks, typed API clients, and App Router endpoints).
- **Cyber Midnight Aesthetics**: Built with high-performance Vanilla CSS, glassmorphism (`backdrop-filter`), dynamic micro-animations, and fluid responsive layouts.

---

## 📁 Production Directory Structure

```text
otp-service-frontend/
├── .env.example                 # Comprehensive environment variable template
├── .env.local                   # Local development configuration overrides
├── .prettierrc                  # Consistent code formatting rules
├── .prettierignore              # Ignore patterns for code formatting
├── next.config.ts               # Production security headers, CSP, image optimization
├── tsconfig.json                # Strict TypeScript configuration with @/* aliases
├── eslint.config.mjs            # ESLint code quality rules
├── package.json                 # Project dependencies & operational scripts
├── src/
│   ├── middleware.ts            # Global edge request tracing & latency headers
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Global Root layout (SEO, typography, Toast provider)
│   │   ├── page.tsx             # Public landing page with embedded interactive sandbox
│   │   ├── loading.tsx          # Global loading suspense fallback
│   │   ├── error.tsx            # Global client-side error boundary
│   │   ├── not-found.tsx        # Styled 404 page
│   │   ├── global-error.tsx     # Root fatal error boundary
│   │   ├── (auth)/              # Route group for authentication
│   │   │   ├── layout.tsx       # Auth shell with cyber glow aesthetic
│   │   │   ├── login/page.tsx   # Sign-in console
│   │   │   └── register/page.tsx# Workspace creation
│   │   ├── (dashboard)/         # Route group for management console
│   │   │   ├── layout.tsx       # Dashboard layout with Sidebar, Topbar, and Footer
│   │   │   └── dashboard/
│   │   │       ├── page.tsx     # Performance KPI overview & throughput charts
│   │   │       ├── simulator/   # Interactive OTP testbed & challenge simulator
│   │   │       ├── logs/        # Real-time verification audit logs ledger
│   │   │       ├── templates/   # Multi-channel template editor (SMS, WhatsApp, Email)
│   │   │       ├── api-keys/    # API key generation, scopes & rate limit tiers
│   │   │       ├── providers/   # Telecom & Email gateway routing topology
│   │   │       └── settings/    # Security policies, expiry TTL, webhooks
│   │   └── api/                 # Scalable API Route Handlers
│   │       ├── health/route.ts  # Health check & uptime probe
│   │       ├── otp/
│   │       │   ├── send/route.ts    # POST: Dispatch OTP challenge
│   │       │   ├── verify/route.ts  # POST: Verify OTP challenge
│   │       │   └── logs/route.ts    # GET: Query and filter verification audit logs
│   │       └── keys/route.ts    # GET/POST: API credential management
│   ├── components/
│   │   ├── ui/                  # Reusable polymorphic design tokens
│   │   │   ├── button.tsx       # Variants: primary, secondary, outline, ghost, danger
│   │   │   ├── card.tsx         # Glassmorphic card suite
│   │   │   ├── badge.tsx        # Status semantic badges
│   │   │   ├── input.tsx        # Accessible inputs with error/helper states
│   │   │   ├── stat-card.tsx    # Metric KPI cards with trend indicators
│   │   │   ├── modal.tsx        # Accessible backdrop-blurred modal dialogs
│   │   │   ├── toast.tsx        # Floating notification system
│   │   │   └── table.tsx        # High-density responsive data table
│   │   ├── layout/              # Shell components (Sidebar, Topbar, Footer)
│   │   └── modules/             # High-level domain widgets
│   │       ├── otp-simulator.tsx # Interactive test console with live countdown
│   │       ├── otp-logs-table.tsx # Filterable audit ledger with search & copy
│   │       ├── metrics-chart.tsx # Throughput visualizer & distribution breakdown
│   │       └── api-key-list.tsx  # Secret key creator & copy drawer
│   ├── hooks/                   # Custom React Hooks
│   │   ├── use-otp.ts           # End-to-end dispatch, verify & cooldown state
│   │   ├── use-debounce.ts      # Debounced search inputs
│   │   ├── use-clipboard.ts     # Safe clipboard copying with fallback
│   │   └── use-toast.ts         # Toast event dispatching
│   ├── lib/                     # Core Business Logic & Infrastructure
│   │   ├── api-client.ts        # Centralized fetch client with retry & timeout
│   │   ├── env.ts               # Type-safe environment validation
│   │   ├── utils.ts             # Formatting, masking, ID generation, cn()
│   │   └── otp-store.ts         # In-memory simulator engine & audit ledger
│   ├── types/                   # Strictly Typed Domain Definitions
│   │   ├── otp.ts               # OTP payload, response, and log models
│   │   ├── api.ts               # Universal ApiResponse<T> and pagination
│   │   └── provider.ts          # Gateway health and topology models
│   ├── config/                  # Declarative Application Configurations
│   │   ├── constants.ts         # Route paths, default TTL, channel enums
│   │   └── site.ts              # Site metadata and branding
│   └── styles/
│       └── globals.css          # Design system, CSS variables, glassmorphism tokens
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ (Node v20+ recommended)
- **NPM**: v9+

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```
*(The default `.env.local` runs immediately in Sandbox mode with full simulation capabilities without requiring live telecom gateway credentials).*

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

### 1. Health Probe
- **Endpoint**: `GET /api/health`
- **Description**: Returns cluster uptime, memory usage, and gateway subsystem status.

### 2. Dispatch OTP
- **Endpoint**: `POST /api/otp/send`
- **Request Body**:
```json
{
  "recipient": "+15552348901",
  "channel": "sms",
  "length": 6,
  "expirySeconds": 300
}
```

### 3. Verify OTP
- **Endpoint**: `POST /api/otp/verify`
- **Request Body**:
```json
{
  "recipient": "+15552348901",
  "code": "849201"
}
```

### 4. Query Audit Logs
- **Endpoint**: `GET /api/otp/logs?page=1&limit=20&channel=sms&status=verified`
- **Description**: Paginated query of verification challenges with filter support.

---

## 🚢 Production Build & Verification

To compile the optimized production bundle:
```bash
npm run build
npm start
```

To run lint checks:
```bash
npm run lint
```
