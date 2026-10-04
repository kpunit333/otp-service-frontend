/**
 * OTP Service Operational Constants
 */
export const OTP_CONFIG = {
  DEFAULT_LENGTH: 6,
  MIN_LENGTH: 4,
  MAX_LENGTH: 8,
  DEFAULT_EXPIRY_SECONDS: 300, // 5 minutes
  DEFAULT_MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 45,
} as const;

export const DELIVERY_CHANNELS = [
  { id: "sms", label: "SMS Text", icon: "Phone", description: "Direct telecom carrier SMS" },
  { id: "whatsapp", label: "WhatsApp", icon: "MessageSquare", description: "Encrypted instant message" },
  { id: "email", label: "Email", icon: "Mail", description: "Rich HTML or text token" },
] as const;
