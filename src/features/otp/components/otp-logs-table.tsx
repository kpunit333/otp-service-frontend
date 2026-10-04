"use client";

import React, { useState, useEffect, useCallback } from "react";
import { OtpLogItem, OtpStatus } from "@/types/otp";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, Copy, Check } from "lucide-react";
import { formatDate, maskRecipient } from "@/lib/utils";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDebounce } from "@/hooks/use-debounce";
import { apiClient } from "@/lib/api-client";
import { PaginatedResult } from "@/types/api";
import { API_ENDPOINTS } from "@/constants/api";

export function OtpLogsTable() {
  const [logs, setLogs] = useState<OtpLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { copy, isCopied } = useClipboard();

  const debouncedSearch = useDebounce(search, 300);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<PaginatedResult<OtpLogItem>>(API_ENDPOINTS.OTP_LOGS, {
        params: {
          search: debouncedSearch || undefined,
          channel: channelFilter !== "all" ? channelFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          limit: 20,
        },
      });
      setLogs(data.items || []);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, channelFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getStatusBadge = (status: OtpStatus) => {
    switch (status) {
      case "verified":
        return <Badge variant="success">Verified</Badge>;
      case "pending":
        return <Badge variant="info">Pending</Badge>;
      case "expired":
        return <Badge variant="warning">Expired</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Filtering Header Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "260px" }}>
          <Input
            placeholder="Search by recipient, request ID, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Channel Filters */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="input-base"
            style={{ width: "auto", padding: "0.55rem 0.85rem", cursor: "pointer" }}
          >
            <option value="all">All Channels</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>

          {/* Status Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base"
            style={{ width: "auto", padding: "0.55rem 0.85rem", cursor: "pointer" }}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="failed">Failed</option>
          </select>

          <Button
            variant="outline"
            size="md"
            onClick={() => fetchLogs()}
            isLoading={isLoading}
            leftIcon={<RotateCw size={14} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Request ID</TableHeader>
              <TableHeader>Recipient</TableHeader>
              <TableHeader>Channel</TableHeader>
              <TableHeader>Provider</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Latency</TableHeader>
              <TableHeader>Dispatched At</TableHeader>
              <TableHeader style={{ textAlign: "right" }}>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  {isLoading ? "Querying verification ledger..." : "No verification logs match the criteria."}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {log.requestId}
                  </TableCell>
                  <TableCell style={{ fontWeight: 600 }}>{maskRecipient(log.recipient)}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {log.channel}
                    </span>
                  </TableCell>
                  <TableCell style={{ textTransform: "capitalize", color: "var(--text-muted)" }}>
                    {log.provider}
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {log.latencyMs}ms
                  </TableCell>
                  <TableCell style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => copy(log.requestId, log.id)}
                      title="Copy Request ID"
                      className="btn-action-icon"
                      style={{ padding: "4px" }}
                    >
                      {isCopied(log.id) ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
