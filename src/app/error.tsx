"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime Error Boundary caught:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "500px",
          width: "100%",
          padding: "2.5rem 2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "rgba(244, 63, 94, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-rose)",
          }}
        >
          <AlertCircle size={32} />
        </div>

        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Something went wrong</h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
              lineHeight: 1.4,
            }}
          >
            {error.message || "An unexpected error occurred while communicating with the OTP service."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Button variant="primary" onClick={() => reset()} leftIcon={<RotateCcw size={16} />}>
            Try Again
          </Button>
          <Link href={ROUTES.HOME}>
            <Button variant="outline" leftIcon={<Home size={16} />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
