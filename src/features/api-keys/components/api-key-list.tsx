"use client";

import React, { useState, useEffect } from "react";
import { ApiKeyItem } from "@/types/otp";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Plus, Copy, Check, Key, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useClipboard } from "@/hooks/use-clipboard";
import { useToast } from "@/providers/toast-provider";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";

export function ApiKeyList() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [envChoice, setEnvChoice] = useState<"production" | "sandbox">("production");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const { copy, isCopied } = useClipboard();
  const { showToast } = useToast();

  const fetchKeys = async () => {
    try {
      const data = await apiClient<ApiKeyItem[]>(API_ENDPOINTS.KEYS);
      setKeys(data || []);
    } catch (err) {
      console.error("Failed to load keys:", err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      showToast("Key description name is required", "warning");
      return;
    }
    setIsCreating(true);
    try {
      const res = await apiClient<ApiKeyItem & { rawKey: string }>(API_ENDPOINTS.KEYS, {
        method: "POST",
        body: { name: keyName, env: envChoice },
      });

      setNewlyCreatedKey(res.rawKey);
      showToast("API Key successfully generated", "success");
      fetchKeys();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create key", "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Authorized API Keys</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Authenticate external backend services to dispatch and verify OTPs via REST API.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setNewlyCreatedKey(null);
            setKeyName("");
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={16} />}
        >
          Create New Secret Key
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name / Service</TableHeader>
              <TableHeader>Secret Key</TableHeader>
              <TableHeader>Rate Limit</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Last Used</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader style={{ textAlign: "right" }}>Copy</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((k) => (
              <TableRow key={k.id}>
                <TableCell style={{ fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Key size={14} color="var(--primary)" />
                    <span>{k.name}</span>
                  </div>
                </TableCell>
                <TableCell style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {k.maskedKey}
                </TableCell>
                <TableCell>{k.rateLimitPerMinute} req/min</TableCell>
                <TableCell style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {formatDate(k.createdAt)}
                </TableCell>
                <TableCell style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {k.lastUsedAt ? formatDate(k.lastUsedAt) : "Never"}
                </TableCell>
                <TableCell>
                  <Badge variant={k.status === "active" ? "success" : "neutral"}>
                    {k.status}
                  </Badge>
                </TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      copy(k.maskedKey, k.id);
                      showToast("Key copied to clipboard", "info");
                    }}
                  >
                    {isCopied(k.id) ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate API Secret Key">
        {newlyCreatedKey ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                gap: "0.75rem",
              }}
            >
              <ShieldCheck size={20} color="var(--accent-emerald)" />
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-emerald)" }}>
                  Secret Key Created
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                  Please copy this key now. For security purposes, it will never be displayed again.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "0.85rem",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                wordBreak: "break-all",
                color: "var(--accent-cyan)",
                border: "1px solid var(--border-medium)",
              }}
            >
              {newlyCreatedKey}
            </div>

            <Button
              variant="primary"
              onClick={() => {
                copy(newlyCreatedKey);
                showToast("Key copied to clipboard", "success");
              }}
              leftIcon={<Copy size={16} />}
            >
              Copy Secret Key
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Input
              label="Key Identifier / Service Name"
              placeholder="e.g. Mobile App Auth Service"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>
                Target Environment
              </label>
              <select
                value={envChoice}
                onChange={(e) => setEnvChoice(e.target.value as "production" | "sandbox")}
                className="input-base"
              >
                <option value="production">Production (High Throughput - 600 req/min)</option>
                <option value="sandbox">Sandbox / Staging (Rate limited - 120 req/min)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreating}>
                Generate Key
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
