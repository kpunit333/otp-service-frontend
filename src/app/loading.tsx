import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <Loader2 size={36} color="var(--primary)" className="animate-spin" />
      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>
        Synchronizing OTP Gateway cluster...
      </span>
    </div>
  );
}
