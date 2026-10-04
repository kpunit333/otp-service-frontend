import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", width: "100%" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {label}
          </label>
        )}

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {leftIcon && (
            <div
              style={{
                position: "absolute",
                left: "0.85rem",
                display: "flex",
                alignItems: "center",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            >
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn("input-base", className)}
            style={{
              paddingLeft: leftIcon ? "2.5rem" : "0.85rem",
              borderColor: error ? "var(--accent-rose)" : undefined,
              boxShadow: error ? "0 0 0 2px var(--accent-rose-subtle)" : undefined,
            }}
            {...props}
          />
        </div>

        {error && (
          <span style={{ fontSize: "0.8rem", color: "var(--accent-rose)", fontWeight: 500 }}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
