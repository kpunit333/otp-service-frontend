"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OtpInput } from "@/components/ui/otp-input";
import { useOtp } from "../hooks/use-otp";
import { useToast } from "@/providers/toast-provider";
import { DeliveryChannel } from "@/types/otp";
import { Phone, Mail, MessageSquare, Send, CheckCircle2, RotateCw, ShieldAlert, Sparkles, ShieldCheck, RotateCcw, Loader2 } from "lucide-react";
import { formatTimeRemaining, maskRecipient, cn } from "@/lib/utils";

export function OtpSimulator() {
  const [recipient, setRecipient] = useState("+1 (555) 349-2810");
  const [channel, setChannel] = useState<DeliveryChannel>("sms");
  const [code, setCode] = useState("");
  const { showToast } = useToast();

  const {
    isSending,
    isVerifying,
    lastResponse,
    verifyResult,
    cooldown,
    canResend,
    error,
    sendOtp,
    verifyOtp,
    reset,
  } = useOtp();

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recipient.trim()) {
      showToast("Please enter a valid recipient phone or email.", "warning");
      return;
    }

    const res = await sendOtp({
      recipient,
      channel,
      length: 6,
      expirySeconds: 300,
    });

    if (res?.success) {
      showToast(res.message, "success", "OTP Dispatched");
      if (res.debugCode) {
        setCode(res.debugCode); // Auto-fill in sandbox for developer convenience
      }
    } else {
      showToast("Failed to dispatch code", "error");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      showToast("Please enter all 6 digits of the verification code.", "warning");
      return;
    }

    const res = await verifyOtp({
      recipient,
      code,
      requestId: lastResponse?.requestId,
    });

    if (res?.verified) {
      showToast("Verification successful! Identity verified.", "success", "Authorized");
    } else {
      showToast(res?.message || "Invalid OTP code", "error", "Verification Failed");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
      {/* Dispatch Console */}
      <Card>
        <CardHeader>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle>1. Dispatch Generator</CardTitle>
            <Badge variant="primary">Sandbox Active</Badge>
          </div>
          <CardDescription>
            Simulate real-time OTP transmission across SMS, WhatsApp, and Email channels.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Channel Selection Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Delivery Channel
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                {[
                  { id: "sms" as DeliveryChannel, label: "SMS", icon: Phone },
                  { id: "whatsapp" as DeliveryChannel, label: "WhatsApp", icon: MessageSquare },
                  { id: "email" as DeliveryChannel, label: "Email", icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = channel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="channel-selector-btn"
                      onClick={() => {
                        setChannel(item.id);
                        if (item.id === "email" && !recipient.includes("@")) {
                          setRecipient("developer@company.com");
                        } else if (item.id !== "email" && recipient.includes("@")) {
                          setRecipient("+1 (555) 349-2810");
                        }
                      }}
                      style={{
                        border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                        backgroundColor: isSelected ? "var(--primary-subtle)" : "rgba(255, 255, 255, 0.02)",
                        color: isSelected ? "#ffffff" : "var(--text-secondary)",
                      }}
                    >
                      <Icon size={18} color={isSelected ? "var(--primary)" : "currentColor"} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Input */}
            <Input
              label={channel === "email" ? "Recipient Email Address" : "Recipient Phone Number (E.164 format)"}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={channel === "email" ? "alex@domain.com" : "+15551234567"}
              helperText="In Sandbox mode, simulated messages are created instantaneously without carrier fees."
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isSending}
              disabled={!canResend && !!lastResponse}
              leftIcon={<Send size={16} />}
            >
              {canResend ? "Send OTP Challenge" : `Resend in ${cooldown}s`}
            </Button>
          </form>
        </CardContent>

        {lastResponse && (
          <CardFooter style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-emerald)" }} />
              <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                Dispatched via <strong>{lastResponse.provider.toUpperCase()}</strong> ({lastResponse.requestId})
              </span>
            </div>
            {lastResponse.debugCode && (
              <div
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  border: "1px dashed var(--primary)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Sandbox Debug OTP:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {lastResponse.debugCode}
                </span>
              </div>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Verification Terminal */}
      <Card>
        <CardHeader>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle>2. Verification Terminal</CardTitle>
            {verifyResult?.verified && <Badge variant="success">Verified</Badge>}
            {error && <Badge variant="danger">Invalid</Badge>}
          </div>
          <CardDescription>
            Enter the 6-digit numeric passkey received by the recipient.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.75rem", display: "block" }}>
                6-Digit Security Code
              </label>
              <OtpInput
                length={6}
                value={code}
                onChange={setCode}
                disabled={isVerifying || verifyResult?.verified}
                success={verifyResult?.verified}
                error={!!error}
              />
            </div>

            {verifyResult?.verified ? (
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <CheckCircle2 size={24} color="var(--accent-emerald)" />
                  <div>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-emerald)" }}>
                      Code Authenticated Successfully
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Recipient {maskRecipient(recipient)} verified. Token issued.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="otp-reset-btn"
                  onClick={() => {
                    reset();
                    setCode("");
                  }}
                  title="Simulate another OTP code"
                >
                  <RotateCcw size={15} />
                  <span>New Test</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button
                  type="submit"
                  disabled={isVerifying || code.length < 6}
                  className={cn("otp-verify-submit-btn", code.length === 6 && "ready")}
                  style={{ flex: 1, paddingLeft: "0.5rem" }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Verify</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="otp-reset-btn"
                  onClick={() => {
                    reset();
                    setCode("");
                  }}
                  disabled={isVerifying || (!code && !verifyResult && !error)}
                  title="Clear input and reset simulation"
                >
                  <RotateCcw size={15} />
                  <span>Reset</span>
                </button>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.825rem",
                  color: "var(--accent-rose)",
                }}
              >
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter style={{ justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Token Expiration: 300s
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Rate Window: 5 req/10m
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
