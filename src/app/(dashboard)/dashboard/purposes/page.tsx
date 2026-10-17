import React from "react";
import { PurposeList } from "@/features/purposes";

export const metadata = {
  title: "Purposes & Intents",
  description: "View and manage all verification purposes and intent scopes within your organization",
};

export default function PurposesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <PurposeList />
    </div>
  );
}
