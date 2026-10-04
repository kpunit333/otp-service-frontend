"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { ROUTES } from "@/constants/routes";
import { ShieldCheck, Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Route protection wrapper that ensures only authenticated users
 * can access protected dashboard components and features.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = `${ROUTES.AUTH}?redirect=${encodeURIComponent(pathname || ROUTES.DASHBOARD)}`;
      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          backgroundColor: "var(--bg-main)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, var(--primary), var(--accent-cyan))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px var(--primary-glow)",
          }}
        >
          <ShieldCheck size={32} color="#ffffff" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)" }}>
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>Verifying credentials & session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
