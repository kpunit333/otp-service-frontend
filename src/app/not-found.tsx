"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft,
  LogOut,
  Home,
  ShieldAlert,
  Compass,
  Cpu,
  KeyRound,
  FileText,
  HelpCircle,
  Lock,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME);
    }
  };

  const handleLogoutConfirm = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    showToast("Signed out successfully.", "info", "Session Ended");
    router.push(ROUTES.AUTH);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--bg-app)",
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "560px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 75%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="glass-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "3rem 2.5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.75rem",
          position: "relative",
          zIndex: 1,
          border: "1px solid var(--border-medium)",
          boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Glowing Badge & 404 Header */}
        <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-light)",
              boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
              marginBottom: "1rem",
            }}
          >
            <ShieldAlert size={38} />
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "4.5rem",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              background: "linear-gradient(180deg, #ffffff 30%, var(--text-muted) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </div>
        </div>

        {/* Informative text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.25)",
              color: "var(--accent-rose)",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 auto",
            }}
          >
            <Lock size={12} />
            Route Not Found
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginTop: "0.25rem" }}>
            Lost in the Cloud Matrix
          </h1>
          <p style={{ fontSize: "0.925rem", color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: "460px", margin: "0 auto" }}>
            The requested page or API resource does not exist, has been migrated, or is no longer accessible.
          </p>

          {currentPath && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                border: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--accent-cyan)",
                display: "inline-block",
                wordBreak: "break-all",
              }}
            >
              Missing: {currentPath}
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.85rem",
            justifyContent: "center",
            width: "100%",
            paddingTop: "0.5rem",
          }}
        >
          {/* Go Back button */}
          <button
            type="button"
            onClick={handleGoBack}
            className="nf-action-btn nf-btn-back"
            title="Return to your previous screen"
          >
            <ArrowLeft size={17} className="nf-icon-arrow" />
            <span>Go Back</span>
          </button>

          {/* Go to Dashboard/Home */}
          <Link
            href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="nf-action-btn nf-btn-home"
            title={isAuthenticated ? "Open Dashboard" : "Return to Home Page"}
          >
            <Home size={17} className="nf-icon-home" />
            <span>{isAuthenticated ? "Dashboard" : "Home"}</span>
          </Link>

          {/* Log Out button */}
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="nf-action-btn nf-btn-logout"
            title="Terminate current user session"
          >
            <LogOut size={16} className="nf-icon-logout" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Quick Nav Shortcuts */}
        <div
          style={{
            width: "100%",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            Quick Destinations
          </span>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
              gap: "0.6rem",
            }}
          >
            <Link href={ROUTES.SIMULATOR} className="nf-shortcut-card">
              <Cpu size={15} color="var(--primary)" />
              <span>Simulator</span>
            </Link>

            <Link href={ROUTES.LOGS} className="nf-shortcut-card">
              <FileText size={15} color="var(--accent-emerald)" />
              <span>Audit Logs</span>
            </Link>

            <Link href={ROUTES.API_KEYS} className="nf-shortcut-card">
              <KeyRound size={15} color="var(--accent-amber)" />
              <span>API Keys</span>
            </Link>

            <Link href={ROUTES.AUTH} className="nf-shortcut-card">
              <Compass size={15} color="var(--accent-cyan)" />
              <span>Auth Portal</span>
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign Out"
        description={
          <span>
            Are you sure you want to end your current session ?
          </span>
        }
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay Logged In"
        variant="danger"
        icon="logout"
      />
    </div>
  );
}
