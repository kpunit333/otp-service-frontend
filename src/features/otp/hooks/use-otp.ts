"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { OtpRequestPayload, OtpSendResponse, OtpVerifyResponse } from "@/types/otp";
import { apiClient } from "@/lib/api-client";
import { OTP_CONFIG } from "@/constants/otp";
import { API_ENDPOINTS } from "@/constants/api";

export function useOtp() {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResponse, setLastResponse] = useState<OtpSendResponse | null>(null);
  const [verifyResult, setVerifyResult] = useState<OtpVerifyResponse | null>(null);
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

  const sendOtp = useCallback(async (payload: OtpRequestPayload): Promise<OtpSendResponse | null> => {
    setIsSending(true);
    setError(null);
    setVerifyResult(null);

    try {
      const res = await apiClient<OtpSendResponse>(API_ENDPOINTS.OTP_SEND, {
        method: "POST",
        body: payload,
      });

      setLastResponse(res);
      setCooldown(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to dispatch OTP";
      setError(message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (params: { recipient: string; code: string; requestId?: string }): Promise<OtpVerifyResponse | null> => {
      setIsVerifying(true);
      setError(null);

      try {
        const res = await apiClient<OtpVerifyResponse>(API_ENDPOINTS.OTP_VERIFY, {
          method: "POST",
          body: params,
        });

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
    sendOtp,
    verifyOtp,
    reset,
  };
}
