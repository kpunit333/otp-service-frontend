export interface AppEnv {
  appName: string;
  appDescription: string;
  appUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  isMockEnabled: boolean;
  otpExpirySeconds: number;
  otpCodeLength: number;
  otpMaxAttempts: number;
  otpResendCooldownSeconds: number;
}
