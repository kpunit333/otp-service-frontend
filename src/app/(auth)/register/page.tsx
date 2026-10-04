import React, { Suspense } from "react";
import { AuthCard } from "@/features/auth";

export const metadata = {
  title: "Register Organization | Orion Security",
  description: "Create a new organization entity and provision API keys",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem", fontSize: "0.9rem" }}>
          Loading registration console...
        </div>
      }
    >
      <AuthCard defaultTab="signup" />
    </Suspense>
  );
}
