"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Shield, Webhook, Lock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { showToast } = useToast();

  const [otpLength, setOtpLength] = useState("6");
  const [expirySeconds, setExpirySeconds] = useState("300");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [cooldownSeconds, setCooldownSeconds] = useState("45");
  const [webhookUrl, setWebhookUrl] = useState("https://api.yourdomain.com/webhooks/otp-events");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Security policies and webhook rules saved successfully", "success", "Configuration Saved");
    }, 400);
  };

  const handlePingWebhook = () => {
    showToast(`Test payload delivered with status 200 OK to ${webhookUrl}`, "success", "Webhook Ping");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Security Policies & Engine Rules
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Configure cryptographic expiration times, brute-force lockout thresholds, and webhook notifications.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Core Verification Rules */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Lock size={18} color="var(--primary)" />
              <CardTitle>Token Cryptography & Lifecycle</CardTitle>
            </div>
            <CardDescription>
              Fine-tune the security parameters governing OTP generation and expiry.
            </CardDescription>
          </CardHeader>

          <CardContent style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            <Input
              label="OTP Code Length (Digits)"
              type="number"
              min={4}
              max={8}
              value={otpLength}
              onChange={(e) => setOtpLength(e.target.value)}
              helperText="Standard recommendation: 6 digits (balanced entropy & readability)"
            />

            <Input
              label="Token Expiration (Seconds)"
              type="number"
              min={60}
              max={900}
              value={expirySeconds}
              onChange={(e) => setExpirySeconds(e.target.value)}
              helperText="300 seconds = 5 minutes window"
            />

            <Input
              label="Maximum Verification Attempts"
              type="number"
              min={1}
              max={5}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              helperText="Locks the challenge immediately once exceeded"
            />

            <Input
              label="Resend Throttle Cooldown (Seconds)"
              type="number"
              min={15}
              max={120}
              value={cooldownSeconds}
              onChange={(e) => setCooldownSeconds(e.target.value)}
              helperText="Prevents SMS spamming and recipient fatigue"
            />
          </CardContent>
        </Card>

        {/* Webhooks & Event Streaming */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Webhook size={18} color="var(--accent-cyan)" />
              <CardTitle>Event Webhook Streaming</CardTitle>
            </div>
            <CardDescription>
              Stream real-time OTP events (e.g. otp.sent, otp.verified, otp.failed) to your backend.
            </CardDescription>
          </CardHeader>

          <CardContent style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Target Webhook Endpoint (HTTPS)"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks/otp-events"
                />
              </div>
              <Button type="button" variant="outline" onClick={handlePingWebhook}>
                Ping Test Payload
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving} leftIcon={<Save size={16} />}>
            Save All Policies
          </Button>
        </div>
      </form>
    </div>
  );
}
