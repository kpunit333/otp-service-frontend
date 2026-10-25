"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OtpInput } from "@/components/ui/otp-input";
import { useOtp } from "../hooks/use-otp";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { useClipboard } from "@/hooks/use-clipboard";
import { OtpChannel } from "@/types/otp";
import { Project } from "@/types/project";
import { Purpose } from "@/types/purpose";
import { projectService } from "@/features/projects/services/project-service";
import { purposeService } from "@/features/purposes/services/purpose-service";
import {
  Phone,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Loader2,
  FolderKanban,
  Target,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { maskRecipient, formatTimeRemaining, cn } from "@/lib/utils";

const AVAILABLE_CHANNELS: { id: OtpChannel; label: string; icon: React.ElementType }[] = [
  { id: "SMS", label: "SMS", icon: Phone },
  { id: "EMAIL", label: "Email", icon: Mail },
  { id: "WHATSAPP", label: "WhatsApp", icon: MessageSquare },
];

function OtpSimulatorContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { copy, isCopied } = useClipboard();

  const orgCode = user?.code || "";

  // Data from Project and Purpose tables
  const [projects, setProjects] = useState<Project[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(true);

  // Form states for Generate OTP
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [isSecretRevealed, setIsSecretRevealed] = useState<boolean>(false);

  const [selectedPurposeCode, setSelectedPurposeCode] = useState<string>("");
  const [purposeId, setPurposeId] = useState<string>("");

  const [userId, setUserId] = useState<string>("+1 (555) 349-2810");
  const [channels, setChannels] = useState<OtpChannel[]>(["SMS", "EMAIL", "WHATSAPP"]);

  // Form states for Verify OTP
  const [verifySecretKey, setVerifySecretKey] = useState<string>("");
  const [verifyUserId, setVerifyUserId] = useState<string>("");
  const [code, setCode] = useState<string>("");

  // Inspect payload toggle
  const [showPayloads, setShowPayloads] = useState<boolean>(false);

  const {
    isSending,
    isVerifying,
    lastResponse,
    verifyResult,
    cooldown,
    canResend,
    error,
    generateOtp,
    verifyOtp,
    reset,
  } = useOtp();

  // Load projects and purposes on mount or organization change
  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      setIsLoadingMeta(true);
      try {
        const [projectList, purposeList] = await Promise.all([
          projectService.getProjects(orgCode).catch((err) => {
            console.warn("Could not load projects:", err);
            return [] as Project[];
          }),
          purposeService.getPurposes(orgCode).catch((err) => {
            console.warn("Could not load purposes:", err);
            return [] as Purpose[];
          }),
        ]);

        if (!isMounted) return;

        setProjects(projectList);
        setPurposes(purposeList);

        // Check URL parameters for pre-selected project or purpose
        const urlSecret = searchParams?.get("secretKey") || "";
        const urlProject = searchParams?.get("projectCode") || "";
        const urlPurpose = searchParams?.get("purposeId") || "";
        const urlUser = searchParams?.get("userId") || "";

        if (urlUser) {
          setUserId(urlUser);
        }

        // Set Project selection
        if (urlProject) {
          setSelectedProjectCode(urlProject);
          const found = projectList.find((p) => p.code === urlProject);
          if (found && found.secretKey) {
            setSecretKey(found.secretKey);
          } else if (urlSecret) {
            setSecretKey(urlSecret);
          }
        } else if (urlSecret) {
          setSecretKey(urlSecret);
          const found = projectList.find((p) => p.secretKey === urlSecret);
          if (found) {
            setSelectedProjectCode(found.code);
          } else {
            setSelectedProjectCode("custom");
          }
        } else if (projectList.length > 0) {
          const first = projectList[0];
          setSelectedProjectCode(first.code);
          setSecretKey(first.secretKey || "");
        }

        // Set Purpose selection
        if (urlPurpose) {
          setSelectedPurposeCode(urlPurpose);
          setPurposeId(urlPurpose);
        } else if (purposeList.length > 0) {
          const first = purposeList[0];
          setSelectedPurposeCode(first.code);
          setPurposeId(first.id || first.code);
        }
      } finally {
        if (isMounted) {
          setIsLoadingMeta(false);
        }
      }
    }

    loadMetadata();

    return () => {
      isMounted = false;
    };
  }, [orgCode, searchParams]);

  // Keep verification parameters in sync with generate
  useEffect(() => {
    if (secretKey && !verifySecretKey) {
      setVerifySecretKey(secretKey);
    }
  }, [secretKey, verifySecretKey]);

  useEffect(() => {
    if (userId && !verifyUserId) {
      setVerifyUserId(userId);
    }
  }, [userId, verifyUserId]);

  // When project dropdown changes, update secretKey from project table
  const handleProjectSelect = (codeOrCustom: string) => {
    setSelectedProjectCode(codeOrCustom);
    if (codeOrCustom === "custom") {
      // Keep existing secret key or let user type
      return;
    }
    const found = projects.find((p) => p.code === codeOrCustom);
    if (found) {
      setSecretKey(found.secretKey || "");
      setVerifySecretKey(found.secretKey || "");
    }
  };

  // When purpose dropdown changes, update purposeId from purpose table
  const handlePurposeSelect = (codeOrCustom: string) => {
    setSelectedPurposeCode(codeOrCustom);
    if (codeOrCustom === "custom") {
      return;
    }
    const found = purposes.find((p) => p.code === codeOrCustom);
    if (found) {
      const pid = found.id || found.code;
      setPurposeId(pid);
    }
  };

  // Toggle delivery channel
  const handleToggleChannel = (chan: OtpChannel) => {
    setChannels((prev) => {
      if (prev.includes(chan)) {
        return prev.filter((c) => c !== chan);
      }
      return [...prev, chan];
    });
  };

  // Trigger POST /api/otp/v1/test/generate
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!secretKey.trim()) {
      showToast("Secret key is required from project table.", "warning");
      return;
    }
    if (!purposeId.trim()) {
      showToast("Purpose ID is required from purpose table.", "warning");
      return;
    }
    if (!userId.trim()) {
      showToast("User ID / recipient identifier is required.", "warning");
      return;
    }

    // Keep verification parameters in sync
    setVerifySecretKey(secretKey.trim());
    setVerifyUserId(userId.trim());

    const payload = {
      secretKey: secretKey.trim(),
      purposeId: purposeId.trim(),
      userId: userId.trim(),
      channel: channels,
    };

    const res = await generateOtp(payload);

    if (res?.success) {
      showToast(res.message || "OTP challenge generated successfully!", "success", "OTP Dispatched");
      // Do not auto-fill verification code unless user explicitly clicks "Auto-fill into Verifier" button
    } else {
      showToast("Failed to dispatch OTP challenge", "error");
    }
  };

  // Trigger POST /api/otp/v1/test/verify
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeSecret = (verifySecretKey || secretKey).trim();
    const activeUserId = (verifyUserId || userId).trim();

    if (!activeSecret) {
      showToast("Secret key is required for verification.", "warning");
      return;
    }
    if (!activeUserId) {
      showToast("User ID is required for verification.", "warning");
      return;
    }
    if (code.length < 6) {
      showToast("Please enter all 6 digits of the verification code.", "warning");
      return;
    }

    const payload = {
      secretKey: activeSecret,
      userId: activeUserId,
      code: code.trim(),
    };

    const res = await verifyOtp(payload);

    if (res?.verified) {
      showToast(res.message || "OTP Verified Successfully!", "success", "Authorized");
    } else {
      showToast(res?.message || "Invalid OTP code", "error", "Verification Failed");
    }
  };

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.code === selectedProjectCode);
  }, [projects, selectedProjectCode]);

  const selectedPurpose = useMemo(() => {
    return purposes.find((p) => p.code === selectedPurposeCode);
  }, [purposes, selectedPurposeCode]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Grid: Dispatch Generator & Verification Terminal */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>

        {/* ======================================================== */}
        {/* CARD 1: Dispatch Generator (/api/otp/v1/test/generate)   */}
        {/* ======================================================== */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CardTitle>1. Dispatch Generator</CardTitle>
              </div>
              <Badge variant="primary">generate</Badge>
            </div>
            <CardDescription>
              Generate an OTP challenge. Secret key is sourced from the Project table and Purpose ID is sourced from the Purpose table.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Project Table Picker & Secret Key */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FolderKanban size={14} color="var(--primary)" />
                    <span>Project (from Project Table)</span>
                  </label>
                  {isLoadingMeta && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <RefreshCw size={11} className="animate-spin" /> Loading projects...
                    </span>
                  )}
                </div>

                <select
                  value={selectedProjectCode}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                >
                  {projects.length === 0 ? (
                    <option value="" disabled>No projects loaded from organization</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p.code} value={p.code} style={{ backgroundColor: "#1e1e24", color: "#ffffff" }}>
                        {p.name} ({p.code}) — {p.status}
                      </option>
                    ))
                  )}
                  <option value="custom" style={{ backgroundColor: "#1e1e24", color: "#ffffff" }}>
                    + Custom / Enter Secret Key Manually
                  </option>
                </select>

                {/* Secret Key Input with Show/Hide & Copy */}
                <div style={{ position: "relative", marginTop: "0.25rem" }}>
                  <Input
                    label="Secret Key"
                    type={isSecretRevealed ? "text" : "password"}
                    value={secretKey}
                    onChange={(e) => {
                      setSecretKey(e.target.value);
                      if (selectedProjectCode !== "custom") {
                        setSelectedProjectCode("custom");
                      }
                    }}
                    placeholder="Enter project secret key..."
                    helperText={
                      selectedProject
                        ? `Loaded from project: "${selectedProject.name}" (${selectedProject.code})`
                        : "Required for test/generate authorization."
                    }
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "2.1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsSecretRevealed(!isSecretRevealed)}
                      title={isSecretRevealed ? "Hide secret key" : "Show secret key"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isSecretRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {secretKey ? (
                      <button
                        type="button"
                        onClick={() => copy(secretKey, "secret-key")}
                        title="Copy secret key"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {isCopied("secret-key") ? (
                          <Check size={16} color="var(--accent-emerald)" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Purpose Table Picker & Purpose ID */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Target size={14} color="var(--accent-cyan)" />
                    <span>Purpose (from Purpose Table)</span>
                  </label>
                  {isLoadingMeta && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <RefreshCw size={11} className="animate-spin" /> Loading purposes...
                    </span>
                  )}
                </div>

                <select
                  value={selectedPurposeCode}
                  onChange={(e) => handlePurposeSelect(e.target.value)}
                  className="w-full"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                >
                  {purposes.length === 0 ? (
                    <option value="" disabled>No purposes loaded from organization</option>
                  ) : (
                    purposes.map((p) => (
                      <option key={p.code} value={p.code} style={{ backgroundColor: "#1e1e24", color: "#ffffff" }}>
                        {p.name} ({p.code})
                      </option>
                    ))
                  )}
                  <option value="custom" style={{ backgroundColor: "#1e1e24", color: "#ffffff" }}>
                    + Custom / Enter Purpose ID Manually
                  </option>
                </select>

                <div style={{ marginTop: "0.25rem" }}>
                  <Input
                    label="Purpose ID"
                    value={purposeId}
                    onChange={(e) => {
                      setPurposeId(e.target.value);
                      if (selectedPurposeCode !== "custom") {
                        setSelectedPurposeCode("custom");
                      }
                    }}
                    placeholder="Enter purpose ID (e.g. LOGIN, PURP-101)..."
                    helperText={
                      selectedPurpose
                        ? `Loaded from purpose: "${selectedPurpose.name}" (${selectedPurpose.code})`
                        : "Verification intent identifier from purpose table."
                    }
                  />
                </div>
              </div>

              {/* User ID / Recipient */}
              <div>
                <Input
                  label="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. +15553492810, user@company.com, or user_1001"
                  helperText="User identifier or destination telephone/email address."
                />
              </div>

              {/* Channels Multi-Select */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Delivery Channels
                  </label>
                  {/* <button
                    type="button"
                    onClick={handleSelectAllChannels}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      color: "var(--primary)",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    {channels.length === AVAILABLE_CHANNELS.length ? "Select SMS Only" : "Select All 3 Channels"}
                  </button> */}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  {AVAILABLE_CHANNELS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = channels.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleChannel(item.id)}
                        className="channel-selector-btn"
                        style={{
                          border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                          backgroundColor: isSelected ? "var(--primary-subtle)" : "rgba(255, 255, 255, 0.02)",
                          color: isSelected ? "#ffffff" : "var(--text-secondary)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.35rem",
                          padding: "0.65rem 0.5rem",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Icon size={16} color={isSelected ? "var(--primary)" : "currentColor"} />
                          <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{item.label}</span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: isSelected ? "var(--primary)" : "rgba(255, 255, 255, 0.06)",
                            color: isSelected ? "#ffffff" : "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          {isSelected ? "ACTIVE" : "OFF"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Payload Channel:</span>
                  <code style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    {JSON.stringify(channels)}
                  </code>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSending}
                disabled={!canResend && !!lastResponse}
                leftIcon={<Send size={16} />}
              >
                {canResend
                  ? "Generate & Send OTP"
                  : `Resend in ${formatTimeRemaining(cooldown)} (${cooldown}s)`}
              </Button>
            </form>
          </CardContent>

          {lastResponse && (
            <CardFooter style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.65rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-emerald)" }} />
                <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                  {lastResponse.message}
                </span>
              </div>

              {/* Test / Sandbox Code Display */}
              {(lastResponse.code || lastResponse.debugCode) && (
                <div
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(99, 102, 241, 0.12)",
                    border: "1px dashed var(--primary)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                      Generated Sandbox Passkey:
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: "var(--primary)",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {lastResponse.code || lastResponse.debugCode}
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      const c = lastResponse.code || lastResponse.debugCode || "";
                      setCode(c);
                      showToast(`Passkey ${c} auto-filled into verification input.`, "info", "Auto-Filled");
                    }}
                    leftIcon={<Sparkles size={14} />}
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Auto-fill Code
                  </Button>
                </div>
              )}
            </CardFooter>
          )}
        </Card>

        {/* ======================================================== */}
        {/* CARD 2: Verification Terminal (/api/otp/v1/test/verify)   */}
        {/* ======================================================== */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CardTitle>2. Verification Terminal</CardTitle>
              </div>
              <Badge variant={verifyResult?.verified ? "success" : "primary"}>
                verify
              </Badge>
            </div>
            <CardDescription>
              Verify OTP code using secretKey, userId, and the 6-digit numeric passkey.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Context Summary for Verification */}
              <div
                style={{
                  padding: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "0.825rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Target User ID:</span>
                  <span style={{ fontWeight: 600, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    {verifyUserId || userId || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Secret Key:</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                    {verifySecretKey || secretKey ? "••••••••••••••••" : "Not Provided"}
                  </span>
                </div>
              </div>

              {/* 6-Digit Code */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.75rem", display: "block" }}>
                  6-Digit Verification Code
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

              {/* Result Notification */}
              {verifyResult?.verified ? (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <CheckCircle2 size={26} color="var(--accent-emerald)" />
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-emerald)", margin: 0 }}>
                        OTP Verified Successfully!
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                        User {maskRecipient(verifyUserId || userId)} confirmed via /api/otp/v1/test/verify.
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
                        <span>Verifying with API...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Verify OTP</span>
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
                    title="Clear input and reset"
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
                    backgroundColor: "rgba(244, 63, 94, 0.12)",
                    border: "1px solid rgba(244, 63, 94, 0.35)",
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
              Test Verify Endpoint
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
              /api/otp/v1/test/verify
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: Live Payload Inspector & cURL Documentation   */}
      {/* ======================================================== */}
      <Card>
        <CardHeader>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Code2 size={18} color="var(--primary)" />
              <CardTitle>Live Payload & cURL Inspector</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPayloads(!showPayloads)}
            >
              {showPayloads ? "Hide Payloads" : "Inspect Live JSON Payloads"}
            </Button>
          </div>
          <CardDescription>
            Inspect the exact JSON bodies dispatched to /api/otp/v1/test/generate and /api/otp/v1/test/verify
          </CardDescription>
        </CardHeader>

        {showPayloads && (
          <CardContent>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
              {/* Generate Payload */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                    POST /api/otp/v1/test/generate
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copy(
                        JSON.stringify(
                          {
                            secretKey: secretKey || "<secretKey>",
                            purposeId: purposeId || "<purposeId>",
                            userId: userId || "<userId>",
                            channel: channels,
                          },
                          null,
                          2
                        ),
                        "curl-generate"
                      )
                    }
                    className="btn-action-icon"
                    title="Copy payload"
                  >
                    {isCopied("curl-generate") ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                  </button>
                </div>
                <pre
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.775rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    margin: 0,
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(
                    {
                      secretKey: secretKey || "<from project table>",
                      purposeId: purposeId || "<from purpose table>",
                      userId: userId || "<userId>",
                      channel: channels,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Verify Payload */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-emerald)" }}>
                    POST /api/otp/v1/test/verify
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copy(
                        JSON.stringify(
                          {
                            secretKey: (verifySecretKey || secretKey) || "<secretKey>",
                            userId: (verifyUserId || userId) || "<userId>",
                            code: code || "123456",
                          },
                          null,
                          2
                        ),
                        "curl-verify"
                      )
                    }
                    className="btn-action-icon"
                    title="Copy payload"
                  >
                    {isCopied("curl-verify") ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                  </button>
                </div>
                <pre
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.775rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    margin: 0,
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(
                    {
                      secretKey: (verifySecretKey || secretKey) || "<from project table>",
                      userId: (verifyUserId || userId) || "<userId>",
                      code: code || "<6-digit code>",
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export function OtpSimulator() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={28} className="animate-spin" color="var(--primary)" />
        </div>
      }
    >
      <OtpSimulatorContent />
    </Suspense>
  );
}
