"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Terminal,
  FileText,
  Key,
  Radio,
  Sliders,
  RadioTower,
  FolderKanban,
  MessageSquare,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/providers/auth-provider";
import { useSidebar } from "@/providers/sidebar-provider";

const navItems = [
  { label: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Projects", href: ROUTES.PROJECTS, icon: FolderKanban },
  { label: "Live Simulator", href: ROUTES.SIMULATOR, icon: Terminal, badge: "Interactive" },
  { label: "Delivery Logs", href: ROUTES.LOGS, icon: FileText },
  { label: "Templates", href: ROUTES.TEMPLATES, icon: MessageSquare },
  { label: "API Keys", href: ROUTES.API_KEYS, icon: Key },
  { label: "Gateway Routing", href: ROUTES.PROVIDERS, icon: RadioTower },
  { label: "Security & Rules", href: ROUTES.SETTINGS, icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    router.push(ROUTES.AUTH);
  };

  return (
    <aside
      style={{
        width: isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        minWidth: isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 20,
        transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
      }}
    >
      {/* Brand Header */}
      <div>
        {isCollapsed ? (
          <div
            style={{
              padding: "1rem 0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={toggleSidebar}
              title="Expand Sidebar"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--primary), var(--accent-cyan))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px var(--primary-glow)",
                cursor: "pointer",
                border: "none",
              }}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </button>
            <button
              onClick={toggleSidebar}
              className="btn-action-icon"
              title="Expand Sidebar"
              style={{ padding: "4px" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "1.25rem 1rem 1.25rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--primary), var(--accent-cyan))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px var(--primary-glow)",
                }}
              >
                <ShieldCheck size={22} color="#ffffff" />
              </div>
              <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                <h1 style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {siteConfig.name}
                </h1>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--accent-cyan)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Enterprise v{siteConfig.version}
                </span>
              </div>
            </div>

            <button
              onClick={toggleSidebar}
              className="btn-action-icon"
              title="Collapse Sidebar"
              style={{ padding: "5px", flexShrink: 0 }}
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav
          style={{
            padding: isCollapsed ? "1rem 0.5rem" : "1.25rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            transition: "padding 0.25s ease",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === ROUTES.DASHBOARD
                ? pathname === ROUTES.DASHBOARD
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "center" : "space-between",
                  padding: isCollapsed ? "0.65rem 0" : "0.6rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--primary-subtle)" : "transparent",
                  border: isActive ? "1px solid var(--border-glow)" : "1px solid transparent",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.875rem",
                  transition: "all 0.15s ease",
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: isCollapsed ? 0 : "0.75rem" }}>
                  <Icon size={18} color={isActive ? "var(--primary)" : "currentColor"} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.45rem",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--primary)",
                      color: "#fff",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary)",
                      boxShadow: "0 0 6px var(--primary)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session & Status Footer */}
      <div
        style={{
          padding: isCollapsed ? "0.75rem 0.5rem" : "1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          alignItems: isCollapsed ? "center" : "stretch",
          transition: "padding 0.25s ease",
        }}
      >
        {/* User Profile Pill with Sign Out */}
        {isCollapsed ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.6rem",
              width: "100%",
            }}
          >
            {/* Avatar */}
            <div
              style={{ position: "relative" }}
              title={user?.name ? `${user.name} (${user.code || "Active"})` : "Organization Profile"}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(99, 102, 241, 0.25))",
                  border: "1px solid rgba(14, 165, 233, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono, monospace)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {(user?.code ? user.code.slice(0, 3) : (user?.name || "ORG").slice(0, 3)).toUpperCase()}
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: user?.status === "Active" || !user?.status ? "var(--accent-emerald)" : "var(--accent-amber)",
                  boxShadow: "0 0 6px var(--accent-emerald)",
                  border: "1.5px solid var(--surface-card)",
                }}
                title={`Status: ${user?.status || "Active"}`}
              />
            </div>

            {/* Sign Out Button Icon */}
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              title="Sign Out"
              className="btn-action-icon-danger"
              style={{ padding: "0.45rem", borderRadius: "var(--radius-sm)" }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "0.65rem 0.75rem",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", overflow: "hidden" }}>
              {/* Profile Avatar Badge */}
              <div
                style={{ position: "relative", flexShrink: 0 }}
                title={user?.code ? `Organization Code: ${user.code}` : "Profile Avatar"}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(99, 102, 241, 0.25))",
                    border: "1px solid rgba(14, 165, 233, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-mono, monospace)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {(user?.code ? user.code.slice(0, 3) : (user?.name || "ORG").slice(0, 3)).toUpperCase()}
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    right: "-1px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: user?.status === "Active" || !user?.status ? "var(--accent-emerald)" : "var(--accent-amber)",
                    boxShadow: "0 0 6px var(--accent-emerald)",
                    border: "1.5px solid var(--surface-card)",
                  }}
                  title={`Status: ${user?.status || "Active"}`}
                />
              </div>
              <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {user?.name || "Organization"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      color: "var(--accent-emerald)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.status || "Active"}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.68rem",
                    color: "var(--accent-cyan)",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    letterSpacing: "0.02em",
                  }}
                  title={user?.code ? `Code: ${user.code}` : ""}
                >
                  {user?.code || "—"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              title="Sign Out"
              className="btn-action-icon-danger"
              style={{ padding: "0.35rem" }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        <Link
          href="/"
          title={isCollapsed ? "View Public Portal" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: "0.4rem",
            fontSize: "0.775rem",
            color: "var(--text-muted)",
          }}
        >
          {!isCollapsed && <span>View Public Portal</span>}
          <ExternalLink size={isCollapsed ? 15 : 12} />
        </Link>
      </div>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign Out"
        description={
          <span>
            Are you sure you want to end your session ?
          </span>
        }
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay Logged In"
        variant="danger"
        icon="logout"
      />
    </aside>
  );
}
