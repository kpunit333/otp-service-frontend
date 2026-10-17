# Orion Security — Enterprise Multi-Channel OTP & Verification Service

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
├── environment/                 # Environment configurations (no .env files)
│   ├── env.ts                   # Active runtime configuration (auto-synced)
│   ├── env.dev.ts               # Development environment settings
│   ├── env.staging.ts           # Staging environment settings
│   └── env.prod.ts              # Production environment settings
├── scripts/
│   └── switch-env.js            # Zero-dependency environment synchronization script
├── next.config.ts               # Production security headers, CSP, image optimization
├── tsconfig.json                # Strict TypeScript configuration with @/* aliases
├── package.json                 # Project dependencies & operational scripts
├── src/
│   ├── app/                     # Next.js App Router (Dashboard, Auth, Landing)
│   ├── constants/               # Universal API endpoints mapped directly to real backend
│   ├── features/                # Domain-driven features (auth, projects, api-keys)
│   ├── lib/                     # Core Business Logic & Infrastructure (api-client)
│   └── styles/
│       └── globals.css          # Design system & CSS variables
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ (Node v20+ recommended)
- **NPM**: v9+

### 2. Running Environments
No `.env` files required. Run the application with your targeted environment configuration:

- **Development**:
  ```bash
  npm run dev:development
  ```
- **Staging**:
  ```bash
  npm run dev:staging
  ```
- **Production**:
  ```bash
  npm run dev:production
  ```

Open [http://localhost:3000](http://localhost:3000) in your browser. All API requests connect directly to the real backend server configured in `environment/env.ts` (e.g. `http://localhost:6500` in dev, `http://localhost:6000` in staging).

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
