import React, { Suspense } from "react";
import { AuthCard } from "@/features/auth";

export const metadata = {
  title: "Authentication | Orion Security",
  description: "Sign in or register your organization for Orion Security",
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "2rem",
            fontSize: "0.9rem",
          }}
        >
          Loading authentication console...
        </div>
      }
    >
      <AuthCard defaultTab="login" />
    </Suspense>
  );
}
