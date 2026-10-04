/**
 * Environment Variable Parser & Validator
 * Provides type-safe access to environment variables with fallback defaults.
 */

export interface AppEnv {
  appName: string;
  appDescription: string;
  appUrl: string;
  appEnv: "development" | "staging" | "production";
  apiBaseUrl: string;
  isMockEnabled: boolean;
  otpExpirySeconds: number;
  otpCodeLength: number;
  otpMaxAttempts: number;
}

export function getAppEnv(): AppEnv {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Orion Security",
    appDescription:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Enterprise OTP & Verification Delivery Platform",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    appEnv: (process.env.NEXT_PUBLIC_APP_ENV as AppEnv["appEnv"]) || "development",
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
    isMockEnabled: process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== "false",
    otpExpirySeconds: Number(process.env.OTP_EXPIRY_SECONDS || "300"),
    otpCodeLength: Number(process.env.OTP_CODE_LENGTH || "6"),
    otpMaxAttempts: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS || "3"),
  };
}

export const env = getAppEnv();
