import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  style,
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    success: {
      backgroundColor: "var(--accent-emerald-subtle)",
      color: "var(--accent-emerald)",
      border: "1px solid rgba(16, 185, 129, 0.25)",
    },
    warning: {
      backgroundColor: "var(--accent-amber-subtle)",
      color: "var(--accent-amber)",
      border: "1px solid rgba(245, 158, 11, 0.25)",
    },
    danger: {
      backgroundColor: "var(--accent-rose-subtle)",
      color: "var(--accent-rose)",
      border: "1px solid rgba(244, 63, 94, 0.25)",
    },
    info: {
      backgroundColor: "var(--accent-cyan-subtle)",
      color: "var(--accent-cyan)",
      border: "1px solid rgba(6, 182, 212, 0.25)",
    },
    primary: {
      backgroundColor: "var(--primary-subtle)",
      color: "var(--primary)",
      border: "1px solid var(--border-glow)",
    },
    neutral: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border-subtle)",
    },
  };

  return (
    <span
      className={cn("badge", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        padding: "0.2rem 0.6rem",
        borderRadius: "var(--radius-full)",
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
