import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--primary), var(--accent-cyan))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px var(--primary-glow)",
          }}
        >
          <ShieldCheck size={24} color="#ffffff" />
        </div>
        <span style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          {siteConfig.name}
        </span>
      </Link>

      <div style={{ width: "100%", maxWidth: "440px" }}>{children}</div>
    </div>
  );
}
