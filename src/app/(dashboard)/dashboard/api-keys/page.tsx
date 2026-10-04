import React from "react";
import { ApiKeyList } from "@/features/api-keys";

export const metadata = {
  title: "API Credentials & Rate Limits",
  description: "Manage client secret keys, IP allowlists, and per-service rate limits",
};

export default function ApiKeysPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          API Credentials & Scopes
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Generate secret bearer tokens to authenticate your backends, mobile microservices, and internal workers.
        </p>
      </div>

      <ApiKeyList />
    </div>
  );
}
