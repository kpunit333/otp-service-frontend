import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon,
  accentColor = "var(--primary)",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn("glass-card", className)}
      style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative accent gradient line on top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
        <span
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--text-main)",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-sans)",
          }}
        >
          {value}
        </span>

        {change && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: isPositive ? "var(--accent-emerald)" : "var(--accent-rose)",
            }}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{subtitle}</span>
      )}
    </div>
  );
}
