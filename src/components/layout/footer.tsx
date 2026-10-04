import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "1.5rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "var(--text-muted)",
        fontSize: "0.8rem",
        backgroundColor: "rgba(15, 23, 42, 0.4)",
      }}
    >
      <div>
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Enterprise OTP Infrastructure.
      </div>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <Link href="/api/health" target="_blank" style={{ color: "var(--text-secondary)" }}>
          Health Check API
        </Link>
        <Link href="/dashboard/simulator" style={{ color: "var(--text-secondary)" }}>
          Live Sandbox
        </Link>
        <Link href="/dashboard/settings" style={{ color: "var(--text-secondary)" }}>
          Documentation
        </Link>
      </div>
    </footer>
  );
}
