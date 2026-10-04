/**
 * Core Type Definitions for the OTP Verification & Delivery Service
 */

export type DeliveryChannel = "sms" | "email" | "whatsapp";

export type OtpStatus = "pending" | "verified" | "expired" | "failed";

export type ProviderName = "twilio" | "aws-sns" | "sendgrid" | "messagebird" | "whatsapp-cloud";

export interface OtpRequestPayload {
  recipient: string; // Phone number with E.164 (e.g. +1234567890) or email address
  channel: DeliveryChannel;
  length?: number; // Default 6
  expirySeconds?: number; // Default 300 (5 mins)
  metadata?: Record<string, unknown>;
  templateId?: string;
}

export interface OtpSendResponse {
  success: boolean;
  requestId: string;
  recipient: string;
  channel: DeliveryChannel;
  status: OtpStatus;
  expiresAt: string; // ISO 8601 string
  message: string;
  provider: ProviderName;
  // In development/test mock mode, we optionally expose the debug code
  debugCode?: string;
}

export interface OtpVerifyPayload {
  requestId?: string;
  recipient: string;
  code: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  verified: boolean;
  requestId: string;
  recipient: string;
  message: string;
  attemptsRemaining: number;
}

export interface OtpLogItem {
  id: string;
  requestId: string;
  recipient: string;
  channel: DeliveryChannel;
  provider: ProviderName;
  status: OtpStatus;
  attempts: number;
  maxAttempts: number;
  latencyMs: number;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
  ipAddress?: string;
}

export interface OtpMetrics {
  totalSent: number;
  totalVerified: number;
  deliverySuccessRate: number; // percentage e.g. 99.4
  verificationRate: number; // percentage e.g. 88.2
  averageLatencyMs: number;
  activePendingOtps: number;
}

export interface OtpTemplate {
  id: string;
  name: string;
  channel: DeliveryChannel;
  templateText: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  createdAt: string;
  lastUsedAt: string | null;
  rateLimitPerMinute: number;
  status: "active" | "revoked";
}
