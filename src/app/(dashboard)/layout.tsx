import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { AuthGuard } from "@/features/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="dashboard-shell">
        <Sidebar />
        <div className="dashboard-main">
          <Topbar />
          <main className="dashboard-content">{children}</main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
