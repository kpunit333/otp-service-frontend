import { AppEnv } from "./env.base";

export const env: AppEnv = {
    appName: "Orion Security",
    appDescription: "Enterprise OTP & Verification Delivery Platform [Development]",
    appUrl: "http://localhost:3000",
    appEnv: "development",
    apiBaseUrl: "http://localhost:5000",
    isMockEnabled: true,
    otpExpirySeconds: 300,
    otpCodeLength: 6,
    otpMaxAttempts: 3,
};
