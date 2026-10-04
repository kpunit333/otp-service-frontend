"use client";

import React from "react";
import { useToast, ToastItem } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "380px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastNotification({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const iconMap = {
    success: <CheckCircle2 size={18} color="var(--accent-emerald)" />,
    error: <AlertCircle size={18} color="var(--accent-rose)" />,
    warning: <AlertTriangle size={18} color="var(--accent-amber)" />,
    info: <Info size={18} color="var(--accent-cyan)" />,
  };

  const borderMap = {
    success: "rgba(16, 185, 129, 0.4)",
    error: "rgba(244, 63, 94, 0.4)",
    warning: "rgba(245, 158, 11, 0.4)",
    info: "rgba(6, 182, 212, 0.4)",
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.85rem 1rem",
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${borderMap[toast.type]}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div style={{ marginTop: "2px" }}>{iconMap[toast.type]}</div>
      <div style={{ flex: 1 }}>
        {toast.title && (
          <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>
            {toast.title}
          </h4>
        )}
        <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="btn-action-icon"
        style={{ padding: "4px" }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
