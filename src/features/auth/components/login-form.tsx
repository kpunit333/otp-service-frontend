"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ROUTES } from "@/constants/routes";
import { Building2, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  initialName?: string;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, onSwitchToSignup, initialName = "", redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(initialName || "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrorMessage(null);

    if (!name.trim()) {
      setApiErrorMessage("Organization Name or Code is required.");
      showToast("Please enter your organization name or code", "warning");
      return;
    }

    if (!password) {
      setApiErrorMessage("Password is required.");
      showToast("Please enter your password", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(name.trim(), password);

      if (res.success) {
        showToast(res.message || "Organization login successful!", "success", "Authenticated");
        setApiErrorMessage(null);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo || ROUTES.DASHBOARD);
        }
      } else {
        // Show exact error message from the API
        const msg = res.error || "Login failed. Please check your credentials.";
        setApiErrorMessage(msg);
        showToast(msg, "error", "Login Failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to connect to authentication service";
      setApiErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* API Error Message Alert Banner */}
      {apiErrorMessage && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.65rem",
            color: "var(--accent-rose)",
            fontSize: "0.85rem",
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ display: "block", marginBottom: "0.2rem" }}>Authentication Notice:</strong>
            <span>{apiErrorMessage}</span>
          </div>
        </div>
      )}

      <Input
        label="Organization Name or Code"
        type="text"
        placeholder="e.g. Acme Corp or ORG04A..."
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (apiErrorMessage) setApiErrorMessage(null);
        }}
        leftIcon={<Building2 size={16} />}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter organization password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (apiErrorMessage) setApiErrorMessage(null);
        }}
        leftIcon={<Lock size={16} />}
        required
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-submit-btn"
        style={{ marginTop: "0.5rem", justifyContent: "space-between" }}
      >
        {isSubmitting ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.65rem", width: "100%" }}>
            <Loader2 size={19} className="animate-spin" />
            <span>Authenticating Account...</span>
          </div>
        ) : (
          <>
            <Lock size={17} />
            <span style={{ flex: 1, textAlign: "center" }}>Sign In to Organization</span>
            <ArrowRight size={18} className="btn-arrow-icon" />
          </>
        )}
      </button>

      <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
        Need to register a new entity?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="btn-link-action"
        >
          Create entity
        </button>
      </div>
    </form>
  );
}
