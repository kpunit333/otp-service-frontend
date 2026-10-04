import React from "react";
import { GatewayTopology } from "@/features/providers";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Gateway Routing & Failover Topology",
  description: "Automated telecom carrier redundancy and failover topology",
};

export default function ProvidersPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Gateway Routing & Failover Topology
          </h1>
          <Badge variant="success">All Channels Online</Badge>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Automated multi-carrier redundancy ensures OTP delivery even when upstream carriers suffer degradation.
        </p>
      </div>

      <GatewayTopology />
    </div>
  );
}
