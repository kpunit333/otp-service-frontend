"use client";

import React from "react";
import "@/styles/globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#090d16", color: "#f8fafc", padding: "2rem" }}>
        <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Fatal System Interruption</h2>
          <p style={{ color: "#94a3b8", margin: "1rem 0" }}>
            {error.message || "A catastrophic error occurred at the root application layer."}
          </p>
          <button
            onClick={() => reset()}
            className="btn-component btn-primary btn-md"
          >
            Restart Application
          </button>
        </div>
      </body>
    </html>
  );
}
