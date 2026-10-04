import React, { Suspense } from "react";
import { AuthCard } from "@/features/auth";

export const metadata = {
  title: "Sign In | OTP Shield",
  description: "Sign in to access your OTP verification console",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem", fontSize: "0.9rem" }}>
          Loading sign in console...
        </div>
      }
    >
      <AuthCard defaultTab="login" />
    </Suspense>
  );
}
