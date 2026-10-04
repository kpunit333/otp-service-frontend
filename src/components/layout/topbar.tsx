"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Terminal, Activity, ShieldCheck, Zap } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function Topbar() {
  const pathname = usePathname();

  // Compute breadcrumb title based on path
  const getPageTitle = (path: string) => {
    if (path === ROUTES.DASHBOARD) return "Verification Performance & Health";
    if (path.startsWith(ROUTES.SIMULATOR)) return "Interactive OTP Sandbox & Dispatch Simulator";
    if (path.startsWith(ROUTES.LOGS)) return "Real-time Verification Audit Logs";
    if (path.startsWith(ROUTES.TEMPLATES)) return "Multi-Channel Message Templates";
    if (path.startsWith(ROUTES.API_KEYS)) return "API Credentials & Rate Limit Scopes";
    if (path.startsWith(ROUTES.PROVIDERS)) return "Telecom & Email Gateways Failover Topology";
    if (path.startsWith(ROUTES.SETTINGS)) return "Security Thresholds & Webhook Triggers";
    return "OTP Shield Management Console";
  };

  return (
    <header
      style={{
        height: "var(--header-height)",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Title & Route Context */}
      <div>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
          {getPageTitle(pathname)}
        </h2>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Workspace: Default Production Cluster (us-east-1)
        </span>
      </div>

      {/* Quick Action Badges and Simulator Shortcut */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Latency Telemetry Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.3rem 0.75rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            fontSize: "0.75rem",
            color: "var(--accent-emerald)",
            fontWeight: 600,
          }}
        >
          <Zap size={14} />
          <span>Avg Dispatch: 180ms</span>
        </div>

        {/* Sandbox Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.3rem 0.75rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--primary-subtle)",
            border: "1px solid var(--border-glow)",
            fontSize: "0.75rem",
            color: "var(--primary)",
            fontWeight: 600,
          }}
        >
          <Activity size={14} />
          <span>Active Nodes: 4</span>
        </div>

        {/* Test Console Action Button */}
        <Link href={ROUTES.SIMULATOR}>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Terminal size={14} />}
          >
            Open Simulator
          </Button>
        </Link>
      </div>
    </header>
  );
}
