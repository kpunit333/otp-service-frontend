import { API_ENDPOINTS } from "@/constants/api";
import { STORAGE_KEYS } from "@/constants/storage";
import {
  OtpGeneratePayload,
  OtpGenerateResponse,
  OtpTestVerifyPayload,
  OtpTestVerifyResponse,
} from "@/types/otp";

/**
 * Service for communicating with the Real OTP Service API
 * Uses /api/otp/v1/test/generate and /api/otp/v1/test/verify
 */
class OtpService {
  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = { ...this.getAuthHeaders(), ...options.headers };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";
    let parsedData: unknown = null;

    if (contentType.includes("application/json")) {
      parsedData = await response.json();
    } else {
      const text = await response.text();
      try {
        parsedData = JSON.parse(text);
      } catch {
        parsedData = text;
      }
    }

    if (!response.ok) {
      const errorMsg =
        typeof parsedData === "object" && parsedData !== null && "message" in parsedData
          ? String((parsedData as { message: unknown }).message)
          : typeof parsedData === "string" && parsedData.length > 0
          ? parsedData
          : `OTP Service API error: ${response.status} ${response.statusText}`;
      const err = new Error(errorMsg);
      (err as unknown as { status: number }).status = response.status;
      throw err;
    }

    return parsedData as T;
  }

  /**
   * Generates and dispatches an OTP challenge
   * POST /api/otp/v1/test/generate
   * Payload:
   * {
   *   "secretKey": "",
   *   "purposeId": "",
   *   "userId": "",
   *   "channel": ["WHATSAPP", "EMAIL", "SMS"]
   * }
   */
  async generateOtp(payload: OtpGeneratePayload): Promise<OtpGenerateResponse> {
    const directUrl = API_ENDPOINTS.OTP_TEST_GENERATE;
    const localProxyUrl = "/api/otp/v1/test/generate";

    const body = {
      secretKey: payload.secretKey.trim(),
      purposeId: payload.purposeId.trim(),
      userId: payload.userId.trim(),
      channel: payload.channel,
    };

    let res: unknown;
    try {
      res = await this.request<unknown>(directUrl, {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (err: unknown) {
      // If direct backend request failed due to connection/CORS and directUrl is not the local route, try local proxy route
      if (directUrl !== localProxyUrl && err instanceof TypeError) {
        try {
          res = await this.request<unknown>(localProxyUrl, {
            method: "POST",
            body: JSON.stringify(body),
          });
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const record = (typeof res === "object" && res !== null ? res : {}) as Record<string, unknown>;
    const dataObj = (typeof record.data === "object" && record.data !== null ? record.data : {}) as Record<string, unknown>;

    // Find any debug code or generated OTP code returned by the backend
    const extractedCode =
      (typeof dataObj.code === "string" && dataObj.code) ||
      (typeof dataObj.otp === "string" && dataObj.otp) ||
      (typeof dataObj.token === "string" && dataObj.token) ||
      (typeof record.code === "string" && record.code) ||
      (typeof record.otp === "string" && record.otp) ||
      (typeof record.debugCode === "string" && record.debugCode) ||
      (typeof record.token === "string" && record.token) ||
      undefined;

    return {
      success: record.success !== false,
      message: String(
        record.message || dataObj.message || "OTP challenge generated and dispatched successfully."
      ),
      data: record.data,
      code: extractedCode,
      debugCode: extractedCode,
      requestId: String(record.requestId || dataObj.requestId || `req_${Date.now()}`),
      status: String(record.status || dataObj.status || "SENT"),
      raw: res,
    };
  }

  /**
   * Verifies an OTP code
   * POST /api/otp/v1/test/verify
   * Payload:
   * {
   *   "secretKey": "",
   *   "userId": "",
   *   "code": ""
   * }
   */
  async verifyOtp(payload: OtpTestVerifyPayload): Promise<OtpTestVerifyResponse> {
    const directUrl = API_ENDPOINTS.OTP_TEST_VERIFY;
    const localProxyUrl = "/api/otp/v1/test/verify";

    const body = {
      secretKey: payload.secretKey.trim(),
      userId: payload.userId.trim(),
      code: payload.code.trim(),
    };

    let res: unknown;
    try {
      res = await this.request<unknown>(directUrl, {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (err: unknown) {
      if (directUrl !== localProxyUrl && err instanceof TypeError) {
        try {
          res = await this.request<unknown>(localProxyUrl, {
            method: "POST",
            body: JSON.stringify(body),
          });
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const record = (typeof res === "object" && res !== null ? res : {}) as Record<string, unknown>;
    const dataObj = (typeof record.data === "object" && record.data !== null ? record.data : {}) as Record<string, unknown>;

    const isVerified =
      record.verified === true ||
      dataObj.verified === true ||
      record.status === "VERIFIED" ||
      dataObj.status === "VERIFIED" ||
      record.success === true;

    return {
      success: record.success !== false,
      verified: isVerified,
      message: String(
        record.message || dataObj.message || (isVerified ? "OTP verified successfully!" : "Verification failed.")
      ),
      data: record.data,
      attemptsRemaining: typeof record.attemptsRemaining === "number" ? record.attemptsRemaining : 3,
      raw: res,
    };
  }
}

export const otpService = new OtpService();
