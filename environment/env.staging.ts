import { AppEnv } from "./env.base";

export const env: AppEnv = {
  appName: "Orion Security (Staging)",
  appDescription: "Enterprise OTP & Verification Delivery Platform [Staging Preview]",
  appUrl: "https://staging.otpshield.io",
  appEnv: "staging",
  apiBaseUrl: "http://localhost:6000",
  isMockEnabled: false,
  otpExpirySeconds: 300,
  otpCodeLength: 6,
  otpMaxAttempts: 3,
  otpResendCooldownSeconds: 120, // 2 minutes resend counter
};
