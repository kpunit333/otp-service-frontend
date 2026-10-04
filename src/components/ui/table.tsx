import React from "react";
import { cn } from "@/lib/utils";

export function TableContainer({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("glass-card", className)}
      style={{
        overflowX: "auto",
        width: "100%",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({
  className,
  children,
  style,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("data-table", className)}
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
        fontSize: "0.875rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHead({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        borderBottom: "1px solid var(--border-subtle)",
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.05em",
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} style={style} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        transition: "background-color 0.15s ease",
        ...style,
      }}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({
  className,
  children,
  style,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      style={{
        padding: "0.85rem 1.25rem",
        fontWeight: 600,
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  style,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      style={{
        padding: "0.95rem 1.25rem",
        color: "var(--text-main)",
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </td>
  );
}
