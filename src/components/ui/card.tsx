import React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("glass-card", className)}
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      style={{
        fontSize: "1.15rem",
        fontWeight: 700,
        color: "var(--text-main)",
        letterSpacing: "-0.01em",
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      style={{
        fontSize: "0.875rem",
        color: "var(--text-secondary)",
        lineHeight: 1.4,
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ flex: 1, ...style }} className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "1rem",
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
