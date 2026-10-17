"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ROUTES } from "@/constants/routes";
import { Building2, Lock, ArrowRight, AlertCircle, CheckCircle2, Copy, Check, Loader2, ShieldCheck, Mail } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: (createdCode?: string) => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const router = useRouter();
  const { signup, login } = useAuth();
  const { showToast } = useToast();
  const { copy, hasCopied } = useClipboard();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Post-creation success screen
  const [createdEntity, setCreatedEntity] = useState<{
    name: string;
    code: string;
    email: string;
    status?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrorMessage(null);

    if (!name.trim()) {
      setApiErrorMessage("Organization Name is required.");
      showToast("Please enter an organization name", "warning");
      return;
    }

    if (!email.trim()) {
      setApiErrorMessage("Organization Email is required.");
      showToast("Please enter an organization email", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setApiErrorMessage("Please enter a valid email address.");
      showToast("Invalid email format", "warning");
      return;
    }

    if (!password) {
      setApiErrorMessage("Password is required.");
      showToast("Please enter a password", "warning");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setApiErrorMessage("Passwords do not match.");
      showToast("Passwords do not match", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup({ name: name.trim(), email: email.trim(), password });

      if (res.success) {
        const orgData = res.organization as { name?: string; code?: string; email?: string; status?: string } | undefined;
        showToast(res.message || "Organization entity created successfully!", "success", "Entity Created");

        if (orgData?.code) {
          setCreatedEntity({
            name: orgData.name || name.trim(),
            code: orgData.code,
            email: orgData.email || email.trim(),
            status: orgData.status,
          });
        } else {
          // If no code returned, move to dashboard
          if (onSuccess) onSuccess();
          else router.push(ROUTES.DASHBOARD);
        }
      } else {
        const msg = res.error || "Failed to create organization entity.";
        setApiErrorMessage(msg);
        showToast(msg, "error", "Registration Failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to organization service";
      setApiErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoLogin = async () => {
    if (!createdEntity) return;
    setIsSubmitting(true);
    try {
      // Login with newly created code or email
      const res = await login(createdEntity.code || createdEntity.email, password);
      if (res.success) {
        showToast("Logged in successfully! Redirecting to dashboard...", "success");
        if (onSuccess) onSuccess();
        else router.push(ROUTES.DASHBOARD);
      } else {
        showToast(res.error || "Please login with your new code or email", "info");
        if (onSwitchToLogin) onSwitchToLogin(createdEntity.code || createdEntity.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If entity just created, show confirmation card with assigned Organization Code & Email
  if (createdEntity) {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div
          style={{
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-emerald)" }}>
            <CheckCircle2 size={20} />
            <strong style={{ fontSize: "0.95rem" }}>Organization Entity Created!</strong>
          </div>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            Entity <strong>{createdEntity.name}</strong> is registered. You can sign in using your <strong>Organization Code</strong> or <strong>Email</strong>:
          </p>

          {/* Organization Code Box */}
          <div style={{ marginTop: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>ASSIGNED CODE:</span>
            <div
              style={{
                padding: "0.65rem 0.85rem",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "var(--font-mono)",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--accent-cyan)",
                border: "1px solid var(--border-medium)",
                marginTop: "0.2rem",
              }}
            >
              <span>{createdEntity.code}</span>
              <button
                type="button"
                onClick={() => {
                  copy(createdEntity.code);
                  showToast("Organization code copied to clipboard", "info");
                }}
                className="btn-action-icon"
                style={{ padding: "0.35rem" }}
                title="Copy Code"
              >
                {hasCopied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Registered Email Box */}
          <div style={{ marginTop: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>REGISTERED EMAIL:</span>
            <div
              style={{
                padding: "0.55rem 0.85rem",
                backgroundColor: "rgba(0, 0, 0, 0.35)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                marginTop: "0.2rem",
              }}
            >
              <Mail size={14} color="var(--primary-light)" />
              <span>{createdEntity.email}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          className="auth-submit-btn"
          onClick={handleAutoLogin}
          style={{
            width: "100%",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          }}
        >
          {isSubmitting ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.65rem", width: "100%" }}>
              <Loader2 size={19} className="animate-spin" />
              <span>Authenticating Session...</span>
            </div>
          ) : (
            <>
              <CheckCircle2 size={19} />
              <span style={{ flex: 1, textAlign: "center" }}>Sign In Now & Open Dashboard</span>
              <ArrowRight size={18} className="btn-arrow-icon" />
            </>
          )}
        </button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSwitchToLogin) onSwitchToLogin(createdEntity.code);
          }}
          style={{ width: "100%" }}
        >
          Switch to Login Form
        </Button>
      </div>
    );
  }

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
            <strong style={{ display: "block", marginBottom: "0.2rem" }}>Registration Notice:</strong>
            <span>{apiErrorMessage}</span>
          </div>
        </div>
      )}

      <Input
        label="Organization Entity Name"
        placeholder="e.g. Acme Identity Labs"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (apiErrorMessage) setApiErrorMessage(null);
        }}
        leftIcon={<Building2 size={16} />}
        helperText="Name of the new entity to register (up to 100 characters)"
        required
      />

      <Input
        label="Organization Email"
        type="email"
        placeholder="e.g. admin@company.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (apiErrorMessage) setApiErrorMessage(null);
        }}
        leftIcon={<Mail size={16} />}
        helperText="Official email for organization admin and login"
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Create secure password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (apiErrorMessage) setApiErrorMessage(null);
        }}
        leftIcon={<Lock size={16} />}
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (apiErrorMessage) setApiErrorMessage(null);
        }}
        leftIcon={<Lock size={16} />}
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
            <span>Creating Organization Entity...</span>
          </div>
        ) : (
          <>
            <ShieldCheck size={19} />
            <span style={{ flex: 1, textAlign: "center" }}>Create Organization Entity</span>
            <ArrowRight size={18} className="btn-arrow-icon" />
          </>
        )}
      </button>

      <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
        Already have an entity code?{" "}
        <button
          type="button"
          onClick={() => {
            if (onSwitchToLogin) onSwitchToLogin();
          }}
          className="btn-link-action"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}
