"use client";

import React, { useRef, useState, useEffect } from "react";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  error = false,
  success = false,
  autoFocus = false,
}: OtpInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount if autoFocus is enabled
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
      // Position cursor at the active slot
      const pos = Math.min(value.length, length);
      inputRef.current.setSelectionRange(pos, pos);
    }
  }, [autoFocus, disabled]);

  // Keep cursor strictly locked to the next active slot from left to right
  const lockCursorPosition = () => {
    if (!inputRef.current) return;
    const pos = Math.min(value.length, length);
    inputRef.current.setSelectionRange(pos, pos);
  };

  const handleContainerClick = () => {
    if (disabled || !inputRef.current) return;
    inputRef.current.focus();
    lockCursorPosition();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const rawVal = e.target.value.replace(/\D/g, "");
    const sanitized = rawVal.slice(0, length);
    onChange(sanitized);

    if (sanitized.length === length && onComplete) {
      onComplete(sanitized);
    }
  };

  // Synchronize selection range whenever value changes
  useEffect(() => {
    if (inputRef.current && isFocused) {
      const pos = Math.min(value.length, length);
      inputRef.current.setSelectionRange(pos, pos);
    }
  }, [value, length, isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent left/right arrow keys from moving cursor to the middle of unfilled space
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      lockCursorPosition();
      return;
    }

    // Backspace: explicitly erase exactly one character from right to left
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      if (value.length > 0) {
        const nextVal = value.slice(0, -1);
        onChange(nextVal);
      }
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (!pastedData) return;
    const nextVal = (value + pastedData).slice(0, length);
    onChange(nextVal);
    if (nextVal.length === length && onComplete) {
      onComplete(nextVal);
    }
  };

  // The active slot index where the cursor currently resides
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div
      onClick={handleContainerClick}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        cursor: disabled ? "not-allowed" : "text",
        userSelect: "none",
        width: "100%",
        maxWidth: "460px",
        margin: "0 auto",
      }}
    >
      {/* Hidden native input capturing all keyboard and touch interactions */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d*"
        maxLength={length}
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => {
          setIsFocused(true);
          lockCursorPosition();
        }}
        onBlur={() => setIsFocused(false)}
        onClick={lockCursorPosition}
        onSelect={lockCursorPosition}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "default",
          zIndex: 1,
          pointerEvents: "auto",
        }}
      />

      {/* Render visible OTP slots */}
      {Array.from({ length }).map((_, idx) => {
        const hasValue = idx < value.length;
        const char = hasValue ? value[idx] : "";
        const isCurrentActive = isFocused && idx === value.length && !disabled;
        const isLastFilledAndActive = isFocused && value.length === length && idx === length - 1;

        let borderColor = "var(--border-medium)";
        let boxShadow = "none";
        let backgroundColor = "rgba(15, 23, 42, 0.75)";

        if (success) {
          borderColor = "var(--accent-emerald)";
          boxShadow = "0 0 12px rgba(16, 185, 129, 0.25)";
          backgroundColor = "rgba(16, 185, 129, 0.08)";
        } else if (error) {
          borderColor = "var(--accent-rose)";
          boxShadow = "0 0 12px rgba(244, 63, 94, 0.25)";
          backgroundColor = "rgba(244, 63, 94, 0.08)";
        } else if (isCurrentActive || isLastFilledAndActive) {
          borderColor = "var(--primary)";
          boxShadow = "0 0 14px var(--primary-glow)";
          backgroundColor = "rgba(99, 102, 241, 0.1)";
        } else if (hasValue) {
          borderColor = "rgba(255, 255, 255, 0.25)";
          backgroundColor = "rgba(15, 23, 42, 0.9)";
        }

        return (
          <div
            key={idx}
            style={{
              flex: 1,
              height: "64px",
              minWidth: "44px",
              maxWidth: "68px",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${borderColor}`,
              backgroundColor,
              boxShadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "all 0.15s ease",
            }}
          >
            {hasValue ? (
              // Display the entered digit
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: success ? "var(--accent-emerald)" : error ? "var(--accent-rose)" : "var(--text-main)",
                  lineHeight: 1,
                }}
              >
                {char}
              </span>
            ) : isCurrentActive ? (
              // Active slot: show glowing blinking cursor right where the visible dot is
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <span className="otp-slot-cursor" />
              </div>
            ) : (
              // Empty slot: show visible dot indicator
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "var(--text-muted)",
                  opacity: 0.45,
                  display: "inline-block",
                  transition: "all 0.15s ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
