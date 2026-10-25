import React from "react";
import { OtpSimulator } from "@/features/otp";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap } from "lucide-react";

export const metadata = {
  title: "Live Sandbox Simulator",
  description: "Interactive real-time OTP dispatching and verification testbed",
};

export default function SimulatorPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Interactive OTP Simulator
          </h1>
          <Badge variant="primary">Sandbox Active</Badge>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Simulate realistic telecom carrier delivery, inspect incoming payload tokens, and test
          verification thresholds under simulated network conditions.
        </p>
      </div>

      {/* Main Interactive Tool */}
      <OtpSimulator />

      {/* Developer Sandbox Instructions Card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield size={18} color="var(--primary)" />
              <CardTitle>Security Simulation Rules</CardTitle>
            </div>
            <CardDescription>How the engine evaluates incoming challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>✓</span>
                <span><strong>Brute Force Lockout:</strong> 3 consecutive incorrect attempts automatically invalidates the challenge.</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>✓</span>
                <span><strong>TTL Expiration:</strong> Active codes automatically expire after 300 seconds (5 minutes).</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>✓</span>
                <span><strong>Anti-Spam Cooldown:</strong> 2-minute (120s) configurable cooldown on successive dispatches per recipient.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={18} color="var(--accent-cyan)" />
              <CardTitle>Direct cURL Testing</CardTitle>
            </div>
            <CardDescription>Execute directly against test endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                padding: "0.85rem",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.775rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              <strong># 1. Generate:</strong><br />
              curl -X POST http://localhost:5000/api/otp/v1/test/generate \<br />
              &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br />
              &nbsp;&nbsp;-d &apos;&#123;&quot;secretKey&quot;: &quot;&lt;PROJECT_KEY&gt;&quot;, &quot;purposeId&quot;: &quot;&lt;PURPOSE_ID&gt;&quot;, &quot;userId&quot;: &quot;+15552348901&quot;, &quot;channel&quot;: [&quot;WHATSAPP&quot;, &quot;EMAIL&quot;, &quot;SMS&quot;]&#125;&apos;<br /><br />
              <strong># 2. Verify:</strong><br />
              curl -X POST http://localhost:5000/api/otp/v1/test/verify \<br />
              &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br />
              &nbsp;&nbsp;-d &apos;&#123;&quot;secretKey&quot;: &quot;&lt;PROJECT_KEY&gt;&quot;, &quot;userId&quot;: &quot;+15552348901&quot;, &quot;code&quot;: &quot;123456&quot;&#125;&apos;
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
