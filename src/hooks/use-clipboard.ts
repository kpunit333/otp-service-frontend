"use client";

import { useState, useCallback, useRef } from "react";

export function useClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const copy = useCallback(
    async (text: string, id?: string) => {
      const targetId = id !== undefined ? id : text;

      const triggerCopied = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setHasCopied(true);
        setCopiedId(targetId);
        timerRef.current = setTimeout(() => {
          setHasCopied(false);
          setCopiedId(null);
        }, timeout);
      };

      if (!navigator?.clipboard) {
        // Fallback for older browsers / iframe contexts
        try {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          triggerCopied();
          return true;
        } catch {
          return false;
        }
      }

      try {
        await navigator.clipboard.writeText(text);
        triggerCopied();
        return true;
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        return false;
      }
    },
    [timeout]
  );

  const isCopied = useCallback(
    (identifier: string) => copiedId === identifier,
    [copiedId]
  );

  return { copy, hasCopied, copiedId, isCopied };
}
