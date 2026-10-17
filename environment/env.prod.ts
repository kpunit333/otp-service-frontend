import { AppEnv } from "./env.base";

export const env: AppEnv = {
  appName: "Orion Security (Prod)",
  appDescription: "Enterprise OTP & Verification Delivery Platform",
  appUrl: "https://otpshield.io",
  appEnv: "production",
  apiBaseUrl: "https://api.otpshield.io",
  isMockEnabled: false,
  otpExpirySeconds: 300,
  otpCodeLength: 6,
  otpMaxAttempts: 3,
};
