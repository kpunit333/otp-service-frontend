import React from "react";
import { ProjectList } from "@/features/projects";

export const metadata = {
  title: "Projects & Applications",
  description: "View and manage all projects, client secrets, and scopes within your organization",
};

export default function ProjectsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Projects &amp; Scopes
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
          Manage discrete application environments, provisioned secret keys, and authentication boundaries for your organization.
        </p>
      </div>

      <ProjectList />
    </div>
  );
}
