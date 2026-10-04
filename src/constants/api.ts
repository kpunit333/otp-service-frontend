/**
 * REST API Endpoint Constants
 */

export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  HEALTH: "/api/health",
  OTP_SEND: "/api/otp/send",
  OTP_VERIFY: "/api/otp/verify",
  OTP_LOGS: "/api/otp/logs",
  KEYS: "/api/keys",

  // Organization & Authentication Service Endpoints (Spring Boot backend on port 5000)
  ORGANIZATION_CREATE: `${BACKEND_BASE_URL}/api/organizations/v1/organization`,
  ORGANIZATION_LOGIN: `${BACKEND_BASE_URL}/api/auth/o/login`,

  // Local Next.js rewrite fallback endpoints to avoid CORS
  PROXY_ORGANIZATION_CREATE: "/api/organizations/v1/organization",
  PROXY_ORGANIZATION_LOGIN: "/api/auth/o/login",

  // Project Endpoints (Base URL: http://localhost:5000/api/organizations/v1)
  ORGANIZATION_PROJECTS: (orgCode: string) =>
    `${BACKEND_BASE_URL}/api/organizations/v1/${orgCode}/project`,
  PROXY_ORGANIZATION_PROJECTS: (orgCode: string) =>
    `/api/organizations/v1/${orgCode}/project`,
} as const;

export const DEFAULT_TIMEOUT_MS = 10000;
