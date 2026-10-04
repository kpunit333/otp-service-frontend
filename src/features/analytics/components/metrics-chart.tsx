"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function MetricsChart() {
  const hourlyData = [
    { time: "00:00", count: 320, successRate: 99.2 },
    { time: "03:00", count: 180, successRate: 98.9 },
    { time: "06:00", count: 450, successRate: 99.6 },
    { time: "09:00", count: 1240, successRate: 99.8 },
    { time: "12:00", count: 1890, successRate: 99.4 },
    { time: "15:00", count: 2150, successRate: 99.7 },
    { time: "18:00", count: 1670, successRate: 99.5 },
    { time: "21:00", count: 980, successRate: 99.1 },
  ];

  const maxCount = Math.max(...hourlyData.map((d) => d.count));

  return (
    <Card>
      <CardHeader>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <CardTitle>Verification Throughput (Last 24 Hours)</CardTitle>
            <CardDescription>
              Volume and delivery completion percentage over 3-hour aggregates
            </CardDescription>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--primary)" }} />
              <span style={{ color: "var(--text-secondary)" }}>Delivered OTPs</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--accent-cyan)" }} />
              <span style={{ color: "var(--text-secondary)" }}>Verified (99.5% Avg)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "0.75rem",
            height: "180px",
            paddingTop: "1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {hourlyData.map((bar) => {
            const heightPercent = Math.round((bar.count / maxCount) * 100);
            return (
              <div
                key={bar.time}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                }}
              >
                <div
                  title={`${bar.time}: ${bar.count.toLocaleString()} dispatches (${bar.successRate}% delivered)`}
                  style={{
                    width: "100%",
                    maxWidth: "42px",
                    height: `${heightPercent}%`,
                    background: "linear-gradient(180deg, var(--accent-cyan) 0%, var(--primary) 100%)",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "brightness(1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bar.time}</span>
              </div>
            );
          })}
        </div>

        {/* Channel Breakdown */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1.25rem",
          }}
        >
          <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>SMS Routing (Twilio / SNS)</span>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.2rem" }}>68.4%</div>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)" }}>99.8% Success Rate</span>
          </div>
          <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>WhatsApp Enterprise API</span>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.2rem" }}>22.1%</div>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)" }}>99.9% Instant Open</span>
          </div>
          <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Email Tokens (SendGrid)</span>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.2rem" }}>9.5%</div>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)" }}>98.7% Inbox Landing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
