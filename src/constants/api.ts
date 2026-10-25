import { env } from "@/environment/env";

/**
 * REST API Endpoint Constants
 * Purely configured from environment/env.ts with zero .env or proxy dependencies.
 */

export const BACKEND_BASE_URL = env.apiBaseUrl
  ? env.apiBaseUrl.startsWith("http://") || env.apiBaseUrl.startsWith("https://")
    ? env.apiBaseUrl
    : `http://${env.apiBaseUrl}`
  : "";

export const API_ENDPOINTS = {
  HEALTH: "/api/health",
  OTP_SEND: "/api/otp/send",
  OTP_VERIFY: "/api/otp/verify",
  OTP_LOGS: "/api/otp/logs",
  KEYS: "/api/keys",

  // Real OTP Service Test Endpoints
  OTP_TEST_GENERATE: `${BACKEND_BASE_URL}/api/otp/v1/test/generate`,
  OTP_TEST_VERIFY: `${BACKEND_BASE_URL}/api/otp/v1/test/verify`,

  // Real Organization & Authentication Service Endpoints
  ORGANIZATION_CREATE: `${BACKEND_BASE_URL}/api/organizations/v1/organization`,
  ORGANIZATION_LOGIN: `${BACKEND_BASE_URL}/api/auth/o/login`,

  // Real Project Service Endpoints
  ORGANIZATION_PROJECTS: (orgCode: string) =>
    `${BACKEND_BASE_URL}/api/organizations/v1/${encodeURIComponent(orgCode)}/project`,
  ORGANIZATION_PROJECT_DETAIL: (orgCode: string, projectCode: string) =>
    `${BACKEND_BASE_URL}/api/organizations/v1/${encodeURIComponent(orgCode)}/project/${encodeURIComponent(projectCode)}`,

  // Real Purpose Service Endpoints
  ORGANIZATION_PURPOSES: (orgCode: string) =>
    `${BACKEND_BASE_URL}/api/organizations/v1/${encodeURIComponent(orgCode)}/purpose`,
  ORGANIZATION_PURPOSE_DETAIL: (orgCode: string, purposeCode: string) =>
    `${BACKEND_BASE_URL}/api/organizations/v1/${encodeURIComponent(orgCode)}/purpose/${encodeURIComponent(purposeCode)}`,
} as const;

export const DEFAULT_TIMEOUT_MS = 10000;
