import { clsx, type ClassValue } from "clsx";

/**
 * Merge multiple class values safely
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format ISO date string to human-readable format
 */
export function formatDate(dateInput: string | Date | number): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Mask recipient phone number or email for security & privacy
 * Example: +1234567890 -> +123****890
 * Example: user@domain.com -> u***r@domain.com
 */
export function maskRecipient(recipient: string): string {
  if (!recipient) return "";
  if (recipient.includes("@")) {
    const [local, domain] = recipient.split("@");
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }
  // Phone number
  const clean = recipient.replace(/\s+/g, "");
  if (clean.length < 6) return clean;
  const start = clean.slice(0, 3);
  const end = clean.slice(-3);
  return `${start}••••${end}`;
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Generate a cryptographically secure random numeric OTP string
 */
export function generateNumericOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }
  return otp;
}

/**
 * Generate a unique ID with custom prefix
 */
export function generateId(prefix = "req"): string {
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}

/**
 * Delay execution for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
