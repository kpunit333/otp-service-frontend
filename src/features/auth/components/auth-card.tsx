"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { AuthMode } from "../types/auth";
import { ShieldCheck, Lock } from "lucide-react";

import { useSearchParams } from "next/navigation";

interface AuthCardProps {
  defaultTab?: AuthMode;
  onSuccess?: () => void;
}

export function AuthCard({ defaultTab = "login", onSuccess }: AuthCardProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const redirectParam = searchParams.get("redirect") || undefined;

  const [activeTab, setActiveTab] = useState<AuthMode>(() => {
    if (tabParam === "signup" || tabParam === "register") return "signup";
    return defaultTab;
  });
  const [prefilledCode, setPrefilledCode] = useState<string>("");

  const handleSwitchToLogin = (code?: string) => {
    if (code) {
      setPrefilledCode(code);
    }
    setActiveTab("login");
  };

  const handleSwitchToSignup = () => {
    setActiveTab("signup");
  };

  return (
    <Card
      className="animate-fade-in"
      style={{
        width: "100%",
        maxWidth: "460px",
        margin: "0 auto",
        boxShadow: "var(--shadow-lg), 0 0 35px rgba(99, 102, 241, 0.15)",
        border: "1px solid var(--border-medium)",
      }}
    >
      <CardHeader style={{ textAlign: "center", alignItems: "center" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--primary), var(--accent-cyan))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.5rem",
            boxShadow: "0 0 20px var(--primary-glow)",
          }}
        >
          <ShieldCheck size={26} color="#ffffff" />
        </div>

        <CardTitle style={{ fontSize: "1.5rem", fontWeight: 800 }}>
          {activeTab === "login" ? "Sign In to Console" : "Create Enterprise Account"}
        </CardTitle>
        <CardDescription style={{ maxWidth: "340px", margin: "0 auto" }}>
          {activeTab === "login"
            ? "Enter your credentials to access OTP logs, simulator, and API keys."
            : "Provision a multi-channel OTP verification cluster with intelligent carrier failover."}
        </CardDescription>

        {/* Interactive Toggle Switch Bar */}
        <div
          style={{
            marginTop: "1.25rem",
            width: "100%",
            display: "flex",
            padding: "4px",
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`auth-tab-btn ${activeTab === "login" ? "active" : "inactive"}`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`auth-tab-btn ${activeTab === "signup" ? "active" : "inactive"}`}
          >
            Create Account
          </button>
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: "0.5rem" }}>
        {activeTab === "login" ? (
          <LoginForm
            key={prefilledCode || "default-login"}
            initialName={prefilledCode}
            redirectTo={redirectParam}
            onSuccess={onSuccess}
            onSwitchToSignup={handleSwitchToSignup}
          />
        ) : (
          <SignupForm
            onSuccess={onSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </CardContent>

      <CardFooter
        style={{
          justifyContent: "center",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.775rem" }}>
          <Lock size={12} color="var(--accent-emerald)" />
          <span>Encrypted with SHA-256 HMAC cryptographic tokens</span>
        </div>
      </CardFooter>
    </Card>
  );
}
