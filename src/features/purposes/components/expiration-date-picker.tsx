"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Infinity as InfinityIcon,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export interface ExpirationDatePickerProps {
  value: string | null | undefined;
  onChange: (isoString: string | null) => void;
  disabled?: boolean;
}

export function ExpirationDatePicker({
  value,
  onChange,
  disabled = false,
}: ExpirationDatePickerProps) {
  const isExpiring = Boolean(value);

  // Parse local date (YYYY-MM-DD) and time (HH:mm) from value
  const parseDateTime = (val: string | null | undefined) => {
    if (!val) {
      // Default to 30 days from now at 23:59
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      defaultDate.setHours(23, 59, 0, 0);
      return {
        date: defaultDate.toISOString().slice(0, 10),
        time: "23:59",
      };
    }

    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) throw new Error("Invalid date");
      // Format to YYYY-MM-DD and HH:mm in local time
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
      };
    } catch {
      return {
        date: new Date().toISOString().slice(0, 10),
        time: "23:59",
      };
    }
  };

  const initial = parseDateTime(value);
  const [selectedDate, setSelectedDate] = useState<string>(initial.date);
  const [selectedTime, setSelectedTime] = useState<string>(initial.time);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const parsed = parseDateTime(value);
      setSelectedDate(parsed.date);
      setSelectedTime(parsed.time);
    }
  }, [value]);

  // Combine date + time into ISO string
  const emitDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr) {
      onChange(null);
      return;
    }
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = (timeStr || "23:59").split(":").map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes, 0, 0);
    onChange(dateObj.toISOString());
  };

  // Switch between Permanent and Expiration
  const handleModeChange = (expiring: boolean) => {
    if (!expiring) {
      onChange(null);
    } else {
      emitDateTime(selectedDate, selectedTime);
    }
  };

  // Quick preset durations
  const applyPresetDays = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    target.setHours(23, 59, 0, 0);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    const hours = String(target.getHours()).padStart(2, "0");
    const minutes = String(target.getMinutes()).padStart(2, "0");

    const newDate = `${year}-${month}-${day}`;
    const newTime = `${hours}:${minutes}`;

    setSelectedDate(newDate);
    setSelectedTime(newTime);
    onChange(target.toISOString());
  };

  // Today string for min date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Relative duration & formatted date display
  const getExpirationInfo = () => {
    if (!value) return null;
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return null;

      const now = Date.now();
      const diffMs = d.getTime() - now;
      const isPast = diffMs < 0;

      const formatted = d.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (isPast) {
        return {
          formatted,
          isPast: true,
          relative: "Selected time has already passed",
        };
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      let relativeText = "";
      if (diffDays > 0) {
        relativeText = `in ${diffDays} day${diffDays === 1 ? "" : "s"}${
          diffHours > 0 ? `, ${diffHours} hr${diffHours === 1 ? "" : "s"}` : ""
        }`;
      } else {
        relativeText = `in ${Math.max(1, diffHours)} hour${diffHours === 1 ? "" : "s"}`;
      }

      return {
        formatted,
        isPast: false,
        relative: relativeText,
      };
    } catch {
      return null;
    }
  };

  const expInfo = getExpirationInfo();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        border: "1px solid var(--border-medium)",
        borderRadius: "var(--radius-md)",
        padding: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
          }}
        >
          <Calendar size={16} color="var(--accent-cyan)" />
          <span>Purpose Expiration Policy</span>
        </label>
        {isExpiring ? (
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--accent-cyan)",
              backgroundColor: "rgba(6, 182, 212, 0.12)",
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
            }}
          >
            Timed Expiry
          </span>
        ) : (
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--accent-emerald)",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            Permanent
          </span>
        )}
      </div>

      {/* Segmented Mode Selector Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          padding: "4px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleModeChange(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.45rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "calc(var(--radius-sm) - 2px)",
            fontSize: "0.825rem",
            fontWeight: 700,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            border: !isExpiring ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid transparent",
            backgroundColor: !isExpiring ? "rgba(16, 185, 129, 0.15)" : "transparent",
            color: !isExpiring ? "#ffffff" : "var(--text-secondary)",
            boxShadow: !isExpiring ? "0 0 12px rgba(16, 185, 129, 0.2)" : "none",
          }}
        >
          <InfinityIcon size={14} color={!isExpiring ? "var(--accent-emerald)" : "currentColor"} />
          <span>Never Expires</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleModeChange(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.45rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "calc(var(--radius-sm) - 2px)",
            fontSize: "0.825rem",
            fontWeight: 700,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            border: isExpiring ? "1px solid var(--border-glow)" : "1px solid transparent",
            backgroundColor: isExpiring ? "var(--primary-subtle)" : "transparent",
            color: isExpiring ? "#ffffff" : "var(--text-secondary)",
            boxShadow: isExpiring ? "0 0 12px var(--primary-glow)" : "none",
          }}
        >
          <Clock size={15} color={isExpiring ? "#38bdf8" : "var(--text-secondary)"} />
          <span>Set Expiration</span>
        </button>
      </div>

      {/* Date & Time Picker Controls (Visible when Expiring is active) */}
      {isExpiring && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.25rem" }}>
          {/* Quick Preset Buttons */}
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.35rem" }}>
              Quick Presets
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {[
                { label: "+24 Hours", days: 1 },
                { label: "+7 Days", days: 7 },
                { label: "+30 Days", days: 30 },
                { label: "+90 Days", days: 90 },
                { label: "+1 Year", days: 365 },
              ].map((p) => (
                <button
                  key={p.days}
                  type="button"
                  disabled={disabled}
                  onClick={() => applyPresetDays(p.days)}
                  style={{
                    padding: "0.3rem 0.65rem",
                    fontSize: "0.775rem",
                    fontWeight: 600,
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-main)",
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.2)";
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "var(--border-medium)";
                    e.currentTarget.style.color = "var(--text-main)";
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Date & Time Inputs with High Contrast Dark Theme */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "0.6rem" }}>
            {/* Expiration Date Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.775rem", color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Calendar size={14} color="#38bdf8" />
                <span>Expiration Date</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Calendar
                  size={15}
                  color="#38bdf8"
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  disabled={disabled}
                  onChange={(e) => {
                    const newD = e.target.value;
                    setSelectedDate(newD);
                    emitDateTime(newD, selectedTime);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem 0.6rem 2.35rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono, monospace)",
                    outline: "none",
                    colorScheme: "dark",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#06b6d4";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(6, 182, 212, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Expiration Time Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.775rem", color: "#a5b4fc", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Clock size={14} color="#a5b4fc" />
                <span>Expiration Time</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Clock
                  size={15}
                  color="#818cf8"
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
                <input
                  type="time"
                  value={selectedTime}
                  disabled={disabled}
                  onChange={(e) => {
                    const newT = e.target.value;
                    setSelectedTime(newT);
                    emitDateTime(selectedDate, newT);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem 0.6rem 2.35rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono, monospace)",
                    outline: "none",
                    colorScheme: "dark",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#818cf8";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Live Expiration Preview Box */}
          {expInfo && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.65rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: expInfo.isPast ? "rgba(244, 63, 94, 0.1)" : "rgba(6, 182, 212, 0.08)",
                border: expInfo.isPast
                  ? "1px solid rgba(244, 63, 94, 0.3)"
                  : "1px solid rgba(6, 182, 212, 0.25)",
              }}
            >
              {expInfo.isPast ? (
                <AlertTriangle size={16} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: "2px" }} />
              ) : (
                <CheckCircle2 size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: "2px" }} />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: expInfo.isPast ? "var(--accent-rose)" : "var(--text-main)",
                  }}
                >
                  {expInfo.isPast ? "Expiration date has already elapsed" : `Expires on ${expInfo.formatted}`}
                </span>
                <span
                  style={{
                    fontSize: "0.725rem",
                    color: expInfo.isPast ? "var(--text-secondary)" : "var(--accent-cyan)",
                    fontWeight: 500,
                  }}
                >
                  {expInfo.relative}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
