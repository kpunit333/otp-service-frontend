import React from "react";
import { StatCard } from "@/components/ui/stat-card";
import { MetricsChart } from "@/features/analytics";
import { OtpSimulator, OtpLogsTable } from "@/features/otp";
import { otpEngine } from "@/lib/otp-store";
import { Send, CheckCircle2, Zap, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = otpEngine.getMetrics();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Banner & Quick Controls */}
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Operational Overview
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Live traffic, verification conversion rates, and gateway health across all channels.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href={ROUTES.SIMULATOR}>
            <Button variant="primary" leftIcon={<Zap size={16} />}>
              Test OTP Dispatch
            </Button>
          </Link>
          <Link href={ROUTES.LOGS}>
            <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
              View Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <StatCard
          title="Total Dispatched"
          value={metrics.totalSent.toLocaleString()}
          change="+14.2%"
          isPositive={true}
          subtitle="Cumulative verified challenges"
          icon={<Send size={20} />}
          accentColor="var(--primary)"
        />
        <StatCard
          title="Carrier Delivery Rate"
          value={`${metrics.deliverySuccessRate}%`}
          change="+0.3%"
          isPositive={true}
          subtitle="Delivered within 5 seconds"
          icon={<CheckCircle2 size={20} />}
          accentColor="var(--accent-emerald)"
        />
        <StatCard
          title="Verification Rate"
          value={`${metrics.verificationRate}%`}
          change="+1.8%"
          isPositive={true}
          subtitle="Total verified completions"
          icon={<ShieldCheck size={20} />}
          accentColor="var(--accent-cyan)"
        />
        <StatCard
          title="Average Latency"
          value={`${metrics.averageLatencyMs}ms`}
          change="-24ms"
          isPositive={true}
          subtitle="Origin to gateway handoff"
          icon={<Clock size={20} />}
          accentColor="var(--accent-amber)"
        />
      </div>

      {/* Throughput Charts */}
      <MetricsChart />

      {/* Live Interactive Sandbox Preview */}
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Quick Sandbox Simulator</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Test live delivery parameters without leaving the dashboard overview.
          </p>
        </div>
        <OtpSimulator />
      </div>

      {/* Recent Ledger Activity */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Recent Ledger Activity</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Auditable records of all challenges dispatched across active gateways.
            </p>
          </div>
          <Link href={ROUTES.LOGS}>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              Full Ledger View
            </Button>
          </Link>
        </div>

        <OtpLogsTable />
      </div>
    </div>
  );
}
