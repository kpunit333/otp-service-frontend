"use client";

import React from "react";
import { OtpLogsTable } from "@/features/otp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

export default function LogsPage() {
  const { showToast } = useToast();

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            environment: "production",
            note: "Audit log exported from Orion Security ledger.",
          },
          null,
          2
        )
      );
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `otp_audit_logs_${Date.now()}.json`);
    dlAnchor.click();
    showToast("Audit ledger exported successfully", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Verification Audit Ledger
            </h1>
            <Badge variant="primary">Real-time Stream</Badge>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Complete historical log of all challenges dispatched, carrier response latencies, and verification attempts.
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={<Download size={14} />}
          onClick={handleExport}
        >
          Export Ledger (JSON)
        </Button>
      </div>

      <OtpLogsTable />
    </div>
  );
}
