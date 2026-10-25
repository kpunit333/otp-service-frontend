"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  OtpGeneratePayload,
  OtpGenerateResponse,
  OtpTestVerifyPayload,
  OtpTestVerifyResponse,
  OtpRequestPayload,
  OtpSendResponse,
  OtpVerifyResponse,
} from "@/types/otp";
import { otpService } from "../services/otp-service";
import { OTP_CONFIG } from "@/constants/otp";

export function useOtp() {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResponse, setLastResponse] = useState<OtpGenerateResponse | null>(null);
  const [verifyResult, setVerifyResult] = useState<OtpTestVerifyResponse | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tick down cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  /**
   * Dispatches OTP generation request via /api/otp/v1/test/generate
   */
  const generateOtp = useCallback(
    async (payload: OtpGeneratePayload): Promise<OtpGenerateResponse | null> => {
      setIsSending(true);
      setError(null);
      setVerifyResult(null);

      try {
        const res = await otpService.generateOtp(payload);
        setLastResponse(res);
        setCooldown(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to dispatch OTP challenge";
        setError(message);
        return null;
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  /**
   * Polymorphic sendOtp alias supporting OtpGeneratePayload
   */
  const sendOtp = useCallback(
    async (
      payload: OtpGeneratePayload | OtpRequestPayload
    ): Promise<OtpGenerateResponse | OtpSendResponse | null> => {
      const normalizedChannel = Array.isArray(payload.channel)
        ? payload.channel
        : typeof payload.channel === "string"
        ? [payload.channel.toUpperCase()]
        : [];

      const generatePayload: OtpGeneratePayload = {
        secretKey: ("secretKey" in payload && payload.secretKey) || "",
        purposeId: ("purposeId" in payload && payload.purposeId) || "",
        userId:
          ("userId" in payload && payload.userId) ||
          ("recipient" in payload && payload.recipient) ||
          "",
        channel: normalizedChannel,
      };

      return generateOtp(generatePayload);
    },
    [generateOtp]
  );

  /**
   * Verifies OTP code via /api/otp/v1/test/verify
   */
  const verifyOtp = useCallback(
    async (
      params: OtpTestVerifyPayload | { recipient?: string; code: string; secretKey?: string; userId?: string }
    ): Promise<OtpTestVerifyResponse | null> => {
      setIsVerifying(true);
      setError(null);

      try {
        const recipient = "recipient" in params ? params.recipient : undefined;
        const verifyPayload: OtpTestVerifyPayload = {
          secretKey: params.secretKey || "",
          userId: params.userId || recipient || "",
          code: params.code,
        };

        const res = await otpService.verifyOtp(verifyPayload);
        setVerifyResult(res);

        if (!res.verified) {
          setError(res.message);
        }
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to verify OTP code";
        setError(message);
        return null;
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLastResponse(null);
    setVerifyResult(null);
    setError(null);
    setCooldown(0);
  }, []);

  return {
    isSending,
    isVerifying,
    lastResponse,
    verifyResult,
    cooldown,
    canResend: cooldown === 0,
    error,
    generateOtp,
    sendOtp,
    verifyOtp,
    reset,
  };
}
