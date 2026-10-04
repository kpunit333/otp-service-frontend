import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OtpSimulator } from "@/features/otp";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  Server,
  Lock,
  Radio,
  Code2,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "70px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--primary), var(--accent-cyan))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px var(--primary-glow)",
              }}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {siteConfig.name}
            </span>
            <Badge variant="primary" style={{ marginLeft: "0.25rem" }}>v{siteConfig.version}</Badge>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link
              href={ROUTES.DASHBOARD}
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}
            >
              Console
            </Link>
            <Link
              href={ROUTES.LOGS}
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}
            >
              Live Logs
            </Link>
            <Link
              href="/api/health"
              target="_blank"
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}
            >
              Health API
            </Link>
            <Link href={ROUTES.AUTH}>
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </Link>
            <Link href={ROUTES.DASHBOARD}>
              <Button size="sm" variant="primary" rightIcon={<ArrowRight size={14} />}>
                Launch Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: "5rem 0 3.5rem", position: "relative" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "900px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              border: "1px solid var(--border-glow)",
              marginBottom: "1.5rem",
            }}
          >
            <Zap size={14} color="var(--primary)" />
            <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--primary)" }}>
              Sub-200ms Verification & Multi-Gateway Failover
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Next-Gen Multi-Channel <br />
            <span
              style={{
                background: "linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              OTP Verification Engine
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
              maxWidth: "720px",
              margin: "0 auto 2.5rem",
            }}
          >
            Deliver mission-critical one-time passwords seamlessly via SMS, WhatsApp, and Email.
            Engineered with intelligent carrier routing, automated failovers, and tamper-proof verification tokens.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={ROUTES.AUTH}>
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={16} />}>
                Sign In to Console
              </Button>
            </Link>
            <Link href={ROUTES.SIMULATOR}>
              <Button size="lg" variant="outline" leftIcon={<Terminal size={16} />}>
                Try Live Simulator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Embedded Live Sandbox Section */}
      <section style={{ padding: "2rem 0 5rem" }}>
        <div className="container" style={{ maxWidth: "1080px" }}>
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Try The Verification Engine Now</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              Experience the end-to-end dispatch and verification pipeline right in your browser.
            </p>
          </div>

          <OtpSimulator />
        </div>
      </section>

      {/* Architectural Features Grid */}
      <section style={{ padding: "4rem 0", backgroundColor: "rgba(15, 23, 42, 0.4)", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Enterprise-Grade Architecture</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Engineered for scalability, zero downtime, and strict security compliance.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <Card>
              <CardContent style={{ paddingTop: "1.5rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--primary-subtle)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Radio size={22} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Intelligent Gateway Failover
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  If Twilio experiences telecom routing latencies, traffic automatically cascades to AWS SNS or MessageBird with zero dropped messages.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: "1.5rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    color: "var(--accent-emerald)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Lock size={22} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Zero Plain-Text Storage
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Tokens are cryptographically signed using HMAC SHA-256 and verified in memory with strict TTL expirations and brute-force lockouts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: "1.5rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(6, 182, 212, 0.12)",
                    color: "var(--accent-cyan)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Server size={22} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  High-Throughput Edge API
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Standard REST API endpoints with granular rate limiting per recipient, IP address, and API secret keys.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Developer API Integration Section */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              <Code2 size={16} />
              <span>DEVELOPER FIRST INTEGRATION</span>
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Dispatch OTP with 1 API Call</h2>
          </div>

          <div
            style={{
              backgroundColor: "#050811",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              overflowX: "auto",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              # Request a new 6-digit OTP challenge via SMS
            </div>
            <div style={{ color: "var(--accent-cyan)" }}>curl -X POST https://api.otpshield.io/api/otp/send \</div>
            <div style={{ color: "var(--text-secondary)", paddingLeft: "1.5rem" }}>
              -H &quot;Authorization: Bearer otpsh_live_8f3a••••••••••••••&quot; \
            </div>
            <div style={{ color: "var(--text-secondary)", paddingLeft: "1.5rem" }}>
              -H &quot;Content-Type: application/json&quot; \
            </div>
            <div style={{ color: "var(--accent-amber)", paddingLeft: "1.5rem" }}>
              -d &apos;&#123;&quot;recipient&quot;: &quot;+15552348901&quot;, &quot;channel&quot;: &quot;sms&quot;, &quot;length&quot;: 6&#125;&apos;
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--border-subtle)",
          padding: "2rem 0",
          backgroundColor: "rgba(15, 23, 42, 0.9)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
          }}
        >
          <div>
            © {new Date().getFullYear()} {siteConfig.name}. Production OTP Verification Infrastructure.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href={ROUTES.DASHBOARD}>Management Console</Link>
            <Link href={ROUTES.LOGS}>Audit Ledger</Link>
            <Link href="/api/health" target="_blank">System Health Probe</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
