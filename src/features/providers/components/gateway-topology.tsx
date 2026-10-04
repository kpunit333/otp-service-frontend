"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

interface ProviderItem {
  id: string;
  name: string;
  channel: "SMS" | "Email" | "WhatsApp";
  status: "operational" | "degraded";
  latency: number;
  deliveryRate: number;
  priority: number;
  isPrimary: boolean;
}

export function GatewayTopology() {
  const { showToast } = useToast();
  const [providers, setProviders] = useState<ProviderItem[]>([
    {
      id: "twilio",
      name: "Twilio Programmable SMS",
      channel: "SMS",
      status: "operational",
      latency: 180,
      deliveryRate: 99.8,
      priority: 1,
      isPrimary: true,
    },
    {
      id: "aws-sns",
      name: "AWS Simple Notification Service (SNS)",
      channel: "SMS",
      status: "operational",
      latency: 210,
      deliveryRate: 99.6,
      priority: 2,
      isPrimary: false,
    },
    {
      id: "sendgrid",
      name: "SendGrid Email Relay",
      channel: "Email",
      status: "operational",
      latency: 320,
      deliveryRate: 98.9,
      priority: 1,
      isPrimary: true,
    },
    {
      id: "whatsapp",
      name: "Meta WhatsApp Cloud API",
      channel: "WhatsApp",
      status: "operational",
      latency: 165,
      deliveryRate: 99.9,
      priority: 1,
      isPrimary: true,
    },
    {
      id: "messagebird",
      name: "MessageBird Carrier Gateway",
      channel: "SMS",
      status: "degraded",
      latency: 580,
      deliveryRate: 96.4,
      priority: 3,
      isPrimary: false,
    },
  ]);

  const togglePrimary = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPrimary: !p.isPrimary } : p))
    );
    showToast("Gateway failover cascade priorities re-ordered", "info");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
      {providers.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Badge variant={p.status === "operational" ? "success" : "warning"}>
                {p.status}
              </Badge>
              {p.isPrimary && <Badge variant="primary">Primary Route</Badge>}
            </div>
            <CardTitle style={{ marginTop: "0.5rem" }}>{p.name}</CardTitle>
            <CardDescription>Channel: {p.channel}</CardDescription>
          </CardHeader>

          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Delivery Success:</span>
                <span style={{ fontWeight: 700, color: "var(--accent-emerald)" }}>{p.deliveryRate}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Roundtrip Latency:</span>
                <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{p.latency}ms</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Cascade Priority:</span>
                <span style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>Tier {p.priority}</span>
              </div>
            </div>

            <div style={{ marginTop: "1.25rem" }}>
              <Button
                variant={p.isPrimary ? "outline" : "secondary"}
                size="sm"
                onClick={() => togglePrimary(p.id)}
                style={{ width: "100%" }}
                leftIcon={<ArrowUpDown size={14} />}
              >
                {p.isPrimary ? "Demote to Secondary" : "Promote to Primary Gateway"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
