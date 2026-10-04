import React from "react";
import { TemplateEditor } from "@/features/templates";

export const metadata = {
  title: "Message Templates",
  description: "Customize SMS, WhatsApp, and Email message templates with placeholder tokens",
};

export default function TemplatesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Message Templates
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Customize copy and dynamic placeholder tokens across SMS, WhatsApp, and Email challenges.
        </p>
      </div>

      <TemplateEditor />
    </div>
  );
}
