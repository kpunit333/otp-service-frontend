import { OtpLogItem, OtpMetrics, OtpRequestPayload, OtpSendResponse, OtpVerifyResponse, ProviderName } from "@/types/otp";
import { generateId, generateNumericOtp } from "./utils";

interface ActiveOtpRecord {
  requestId: string;
  recipient: string;
  channel: OtpRequestPayload["channel"];
  code: string;
  expiresAt: number;
  attemptsRemaining: number;
  maxAttempts: number;
  provider: ProviderName;
  createdAt: number;
}

// In-memory records
const activeRecords = new Map<string, ActiveOtpRecord>();

// Prepopulated realistic audit logs for demo
const mockLogs: OtpLogItem[] = [
  {
    id: "log_1",
    requestId: "req_99a81c",
    recipient: "+1 (555) 234-8901",
    channel: "sms",
    provider: "twilio",
    status: "verified",
    attempts: 1,
    maxAttempts: 3,
    latencyMs: 342,
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 2).toISOString(),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    ipAddress: "192.168.1.10",
  },
  {
    id: "log_2",
    requestId: "req_77c22d",
    recipient: "alex.turner@enterprise.co",
    channel: "email",
    provider: "sendgrid",
    status: "verified",
    attempts: 1,
    maxAttempts: 3,
    latencyMs: 512,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    ipAddress: "142.250.190.46",
  },
  {
    id: "log_3",
    requestId: "req_55b33e",
    recipient: "+44 7700 900123",
    channel: "whatsapp",
    provider: "whatsapp-cloud",
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    latencyMs: 189,
    createdAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 4).toISOString(),
    ipAddress: "82.165.197.1",
  },
  {
    id: "log_4",
    requestId: "req_33d44f",
    recipient: "+1 (555) 890-4321",
    channel: "sms",
    provider: "aws-sns",
    status: "expired",
    attempts: 0,
    maxAttempts: 3,
    latencyMs: 290,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ipAddress: "198.51.100.22",
  },
  {
    id: "log_5",
    requestId: "req_11e55g",
    recipient: "+91 98765 43210",
    channel: "sms",
    provider: "twilio",
    status: "failed",
    attempts: 3,
    maxAttempts: 3,
    latencyMs: 410,
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    ipAddress: "203.0.113.195",
  },
];

export const otpEngine = {
  /**
   * Dispatch an OTP code
   */
  async sendOtp(payload: OtpRequestPayload): Promise<OtpSendResponse> {
    const { recipient, channel, length = 6, expirySeconds = 300 } = payload;
    const code = generateNumericOtp(length);
    const requestId = generateId("req");
    const expiresAtMs = Date.now() + expirySeconds * 1000;

    // Pick provider based on channel
    let provider: ProviderName = "twilio";
    if (channel === "email") provider = "sendgrid";
    if (channel === "whatsapp") provider = "whatsapp-cloud";

    const record: ActiveOtpRecord = {
      requestId,
      recipient,
      channel,
      code,
      expiresAt: expiresAtMs,
      attemptsRemaining: 3,
      maxAttempts: 3,
      provider,
      createdAt: Date.now(),
    };

    activeRecords.set(requestId, record);
    // Also index by recipient for easy lookup
    activeRecords.set(`rec_${recipient}`, record);

    const logItem: OtpLogItem = {
      id: generateId("log"),
      requestId,
      recipient,
      channel,
      provider,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      latencyMs: Math.floor(Math.random() * 250) + 120,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(expiresAtMs).toISOString(),
      ipAddress: "127.0.0.1",
    };

    mockLogs.unshift(logItem);

    return {
      success: true,
      requestId,
      recipient,
      channel,
      status: "pending",
      expiresAt: new Date(expiresAtMs).toISOString(),
      message: `OTP successfully dispatched to ${recipient} via ${channel.toUpperCase()}`,
      provider,
      debugCode: code, // In mock mode, exposed for test console
    };
  },

  /**
   * Verify an OTP code
   */
  async verifyOtp(payload: { recipient: string; code: string; requestId?: string }): Promise<OtpVerifyResponse> {
    const { recipient, code, requestId } = payload;
    let record: ActiveOtpRecord | undefined;

    if (requestId && activeRecords.has(requestId)) {
      record = activeRecords.get(requestId);
    } else if (activeRecords.has(`rec_${recipient}`)) {
      record = activeRecords.get(`rec_${recipient}`);
    }

    if (!record) {
      return {
        success: false,
        verified: false,
        requestId: requestId || "unknown",
        recipient,
        message: "No pending OTP found for this recipient. Please request a new code.",
        attemptsRemaining: 0,
      };
    }

    if (Date.now() > record.expiresAt) {
      activeRecords.delete(record.requestId);
      activeRecords.delete(`rec_${record.recipient}`);
      // Update log
      const log = mockLogs.find((l) => l.requestId === record?.requestId);
      if (log) log.status = "expired";

      return {
        success: false,
        verified: false,
        requestId: record.requestId,
        recipient,
        message: "This OTP code has expired. Please request a new one.",
        attemptsRemaining: 0,
      };
    }

    if (record.code !== code.trim()) {
      record.attemptsRemaining--;
      const log = mockLogs.find((l) => l.requestId === record?.requestId);
      if (log) {
        log.attempts++;
        if (record.attemptsRemaining <= 0) {
          log.status = "failed";
        }
      }

      if (record.attemptsRemaining <= 0) {
        activeRecords.delete(record.requestId);
        activeRecords.delete(`rec_${record.recipient}`);
        return {
          success: false,
          verified: false,
          requestId: record.requestId,
          recipient,
          message: "Maximum invalid attempts exceeded. This OTP is now locked.",
          attemptsRemaining: 0,
        };
      }

      return {
        success: false,
        verified: false,
        requestId: record.requestId,
        recipient,
        message: `Incorrect OTP code. ${record.attemptsRemaining} attempt(s) remaining.`,
        attemptsRemaining: record.attemptsRemaining,
      };
    }

    // Success!
    activeRecords.delete(record.requestId);
    activeRecords.delete(`rec_${record.recipient}`);

    const log = mockLogs.find((l) => l.requestId === record?.requestId);
    if (log) {
      log.status = "verified";
      log.attempts++;
      log.verifiedAt = new Date().toISOString();
    }

    return {
      success: true,
      verified: true,
      requestId: record.requestId,
      recipient,
      message: "OTP successfully verified! Identity confirmed.",
      attemptsRemaining: record.attemptsRemaining,
    };
  },

  /**
   * Fetch all logs
   */
  getLogs(): OtpLogItem[] {
    return [...mockLogs];
  },

  /**
   * Compute aggregate performance metrics
   */
  getMetrics(): OtpMetrics {
    const totalSent = mockLogs.length;
    const totalVerified = mockLogs.filter((l) => l.status === "verified").length;
    const totalActive = mockLogs.filter((l) => l.status === "pending").length;
    const totalDelivered = mockLogs.filter((l) => l.status !== "failed").length;

    const deliverySuccessRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 99.4;
    const verificationRate = totalSent > 0 ? (totalVerified / totalSent) * 100 : 88.6;
    const avgLatency =
      mockLogs.reduce((acc, curr) => acc + curr.latencyMs, 0) / (totalSent || 1);

    return {
      totalSent: 12480 + totalSent,
      totalVerified: 11140 + totalVerified,
      deliverySuccessRate: Number(deliverySuccessRate.toFixed(1)),
      verificationRate: Number(verificationRate.toFixed(1)),
      averageLatencyMs: Math.round(avgLatency),
      activePendingOtps: totalActive,
    };
  },
};
