"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Save, Eye } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

interface TemplateState {
  sms: string;
  whatsapp: string;
  emailSubject: string;
  emailBody: string;
}

export function TemplateEditor() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<TemplateState>({
    sms: "Your {{app_name}} verification code is {{otp}}. Valid for {{expiry_mins}} minutes. Do not share this code.",
    whatsapp: "🔐 *{{app_name}} Security Passcode*\n\nYour one-time authentication code is: *{{otp}}*\n\nExpires in {{expiry_mins}} minutes. Never disclose this token.",
    emailSubject: "Your {{app_name}} Verification Code: {{otp}}",
    emailBody: "Hello,\n\nWe received a request to verify your account. Your security code is:\n\n{{otp}}\n\nThis code will expire in {{expiry_mins}} minutes. If you did not make this request, please ignore this email.",
  });

  const [activeTab, setActiveTab] = useState<"sms" | "whatsapp" | "email">("sms");

  const handleSave = () => {
    showToast("Template settings updated across all carrier channels", "success", "Saved");
  };

  const getPreviewText = (text: string) => {
    return text
      .replace(/{{app_name}}/g, "OTP Shield")
      .replace(/{{otp}}/g, "849201")
      .replace(/{{expiry_mins}}/g, "5");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Channel Switcher */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[
          { id: "sms" as const, label: "SMS Template", icon: Phone },
          { id: "whatsapp" as const, label: "WhatsApp Template", icon: MessageSquare },
          { id: "email" as const, label: "Email HTML Template", icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "primary" : "secondary"}
              onClick={() => setActiveTab(tab.id)}
              leftIcon={<Icon size={16} />}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Editor & Preview Side-by-Side */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Editor */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <CardTitle>Template Configuration</CardTitle>
              <Button size="sm" variant="primary" onClick={handleSave} leftIcon={<Save size={14} />}>
                Save
              </Button>
            </div>
            <CardDescription>
              Use variables like <code>&#123;&#123;otp&#125;&#125;</code>, <code>&#123;&#123;app_name&#125;&#125;</code>, and <code>&#123;&#123;expiry_mins&#125;&#125;</code>.
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {activeTab === "sms" && (
              <textarea
                value={templates.sms}
                onChange={(e) => setTemplates({ ...templates, sms: e.target.value })}
                rows={6}
                className="input-base"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", lineHeight: 1.5 }}
              />
            )}

            {activeTab === "whatsapp" && (
              <textarea
                value={templates.whatsapp}
                onChange={(e) => setTemplates({ ...templates, whatsapp: e.target.value })}
                rows={8}
                className="input-base"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", lineHeight: 1.5 }}
              />
            )}

            {activeTab === "email" && (
              <>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.3rem", display: "block" }}>
                    Subject Line
                  </label>
                  <input
                    value={templates.emailSubject}
                    onChange={(e) => setTemplates({ ...templates, emailSubject: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.3rem", display: "block" }}>
                    Email Body Content
                  </label>
                  <textarea
                    value={templates.emailBody}
                    onChange={(e) => setTemplates({ ...templates, emailBody: e.target.value })}
                    rows={8}
                    className="input-base"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", lineHeight: 1.5 }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Live Preview Device */}
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Eye size={16} color="var(--accent-cyan)" />
                <CardTitle>Recipient Device Render</CardTitle>
              </div>
              <Badge variant="info">Live Render</Badge>
            </div>
            <CardDescription>Simulated view as seen by customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                backgroundColor: "rgba(10, 15, 29, 0.9)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {activeTab === "sms" && (
                <div
                  style={{
                    backgroundColor: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid var(--border-glow)",
                    padding: "1rem",
                    borderRadius: "16px 16px 16px 4px",
                    maxWidth: "85%",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  {getPreviewText(templates.sms)}
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    padding: "1rem",
                    borderRadius: "16px 16px 16px 4px",
                    maxWidth: "85%",
                    fontSize: "0.9rem",
                    whiteSpace: "pre-line",
                    lineHeight: 1.5,
                  }}
                >
                  {getPreviewText(templates.whatsapp)}
                </div>
              )}

              {activeTab === "email" && (
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--accent-cyan)" }}>
                    {getPreviewText(templates.emailSubject)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: 1.5 }}>
                    {getPreviewText(templates.emailBody)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
