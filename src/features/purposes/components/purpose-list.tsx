"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Purpose, CreatePurposePayload, UpdatePurposePayload } from "@/types/purpose";
import { purposeService } from "../services/purpose-service";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { useClipboard } from "@/hooks/use-clipboard";
import { formatDate } from "@/lib/utils";
import {
  Target,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Edit2,
  Trash2,
  Calendar,
  Info,
  Building2,
} from "lucide-react";

export function PurposeList() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { copy, isCopied } = useClipboard();

  // Active organization code (from session or custom prompt)
  const [orgCode, setOrgCode] = useState<string>(user?.code || "");
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Purpose Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreatePurposePayload>({
    name: "",
    description: "",
    expireAt: null,
  });
  const [hasCreateExpiration, setHasCreateExpiration] = useState<boolean>(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  // Edit Purpose Modal State
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);
  const [editForm, setEditForm] = useState<UpdatePurposePayload>({
    name: "",
    description: "",
    expireAt: null,
  });
  const [hasEditExpiration, setHasEditExpiration] = useState<boolean>(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // View Detail Modal State
  const [viewingPurpose, setViewingPurpose] = useState<Purpose | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingPurpose, setDeletingPurpose] = useState<Purpose | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false);

  // Sync orgCode if user updates in session
  useEffect(() => {
    if (user?.code && !orgCode) {
      setOrgCode(user.code);
    }
  }, [user?.code, orgCode]);

  // Load Purposes from API
  const loadPurposes = async (silent = false) => {
    const currentOrg = orgCode.trim() || user?.code || "";
    if (!currentOrg) {
      setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await purposeService.getPurposes(currentOrg);
      setPurposes(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve purposes";
      console.warn("Purpose fetch error:", msg);
      showToast(msg, "warning", "Organization Service");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPurposes();
  }, [orgCode]);

  // Open Create Modal helper
  const handleOpenCreate = () => {
    setCreateForm({
      name: "",
      description: "",
      expireAt: null,
    });
    setHasCreateExpiration(false);
    setIsCreateOpen(true);
  };

  // Submit Create Purpose
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentOrg = orgCode.trim() || user?.code || "";
    if (!currentOrg) {
      showToast("Organization code is required to create a purpose", "error");
      return;
    }

    if (!createForm.name.trim()) {
      showToast("Purpose name is required", "error");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const payload: CreatePurposePayload = {
        name: createForm.name.trim(),
        description: createForm.description?.trim() || "",
        expireAt: hasCreateExpiration && createForm.expireAt ? createForm.expireAt : null,
      };

      const newPurpose = await purposeService.createPurpose(currentOrg, payload);
      showToast(`Purpose "${newPurpose.name}" created successfully!`, "success");
      setIsCreateOpen(false);
      await loadPurposes(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create purpose";
      showToast(msg, "error", "Creation Failed");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal helper
  const handleOpenEdit = (purpose: Purpose) => {
    setEditingPurpose(purpose);
    setEditForm({
      name: purpose.name,
      description: purpose.description || "",
      expireAt: purpose.expireAt || null,
    });
    setHasEditExpiration(!!purpose.expireAt);
    setIsEditOpen(true);
  };

  // Submit Edit Purpose
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentOrg = orgCode.trim() || user?.code || "";
    if (!currentOrg || !editingPurpose) return;

    if (!editForm.name?.trim()) {
      showToast("Purpose name cannot be empty", "error");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const payload: UpdatePurposePayload = {
        name: editForm.name.trim(),
        description: editForm.description !== undefined ? editForm.description.trim() : "",
        expireAt: hasEditExpiration && editForm.expireAt ? editForm.expireAt : null,
      };

      const updated = await purposeService.updatePurpose(currentOrg, editingPurpose.code, payload);
      showToast(`Purpose "${updated.name}" updated successfully!`, "success");
      setIsEditOpen(false);
      setEditingPurpose(null);
      await loadPurposes(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update purpose";
      showToast(msg, "error", "Update Failed");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // View Details helper
  const handleViewDetail = async (purpose: Purpose) => {
    const currentOrg = orgCode.trim() || user?.code || "";
    setViewingPurpose(purpose);
    if (!currentOrg) return;

    setIsLoadingDetail(true);
    try {
      const detail = await purposeService.getPurpose(currentOrg, purpose.code);
      setViewingPurpose(detail);
    } catch (err) {
      // Keep existing item as fallback
      console.warn("Could not fetch detailed purpose info:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (purpose: Purpose) => {
    setDeletingPurpose(purpose);
    setIsDeleteOpen(true);
  };

  // Submit Delete Purpose
  const handleDeleteSubmit = async () => {
    const currentOrg = orgCode.trim() || user?.code || "";
    if (!currentOrg || !deletingPurpose) return;

    setIsSubmittingDelete(true);
    try {
      await purposeService.deletePurpose(currentOrg, deletingPurpose.code);
      showToast(`Purpose "${deletingPurpose.name}" deleted successfully.`, "success");
      setIsDeleteOpen(false);
      setDeletingPurpose(null);
      await loadPurposes(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete purpose";
      showToast(msg, "error", "Delete Failed");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Filter purposes
  const filteredPurposes = useMemo(() => {
    return purposes.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });
  }, [purposes, searchQuery]);

  // Expiration helper
  const isExpired = (expireAt?: string | null) => {
    if (!expireAt) return false;
    return new Date(expireAt).getTime() < Date.now();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header and Controls */}
      <div
        className="glass-card"
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Organization Scope Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-light)",
            }}
          >
            <Target size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Organization Purposes</h2>
              <Badge variant="primary">{filteredPurposes.length} Purposes</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <Building2 size={13} />
              <span>Scope:</span>
              <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {orgCode || user?.code || "Default Organization"}
              </code>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPurposes(true)}
            disabled={isRefreshing}
            title="Reload from API"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </Button>

          {/* Create Purpose Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus size={16} />}
          >
            New Purpose
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Input
            placeholder="Search by purpose name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} color="var(--text-muted)" />}
          />
        </div>
      </div>

      {/* Purposes Table / List */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader style={{ width: "30%" }}>Purpose</TableHeader>
              <TableHeader style={{ width: "22%" }}>Purpose Code</TableHeader>
              <TableHeader style={{ width: "20%" }}>Expiration</TableHeader>
              <TableHeader style={{ width: "16%" }}>Created At</TableHeader>
              <TableHeader style={{ width: "12%", textAlign: "right" }}>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <RefreshCw size={24} className="animate-spin" color="var(--primary)" />
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Fetching organization purposes...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPurposes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center", padding: "3.5rem 1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", maxWidth: "400px", margin: "0 auto" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Target size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>No Purposes Found</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                      {searchQuery
                        ? `No purposes matching "${searchQuery}". Try clearing your search.`
                        : "No verification purposes created for this organization yet. Create your first purpose to get started."}
                    </p>
                    {!searchQuery && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleOpenCreate}
                        leftIcon={<Plus size={14} />}
                        style={{ marginTop: "0.5rem" }}
                      >
                        Create First Purpose
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPurposes.map((purpose) => {
                const expired = isExpired(purpose.expireAt);
                return (
                  <TableRow key={purpose.code}>
                    {/* Name & Description */}
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "rgba(14, 165, 233, 0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary)",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <Target size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                            {purpose.name}
                          </div>
                          {purpose.description ? (
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                                marginTop: "2px",
                                maxWidth: "340px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={purpose.description}
                            >
                              {purpose.description}
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "2px" }}>
                              No description provided
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Purpose Code with Copy Button */}
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <code
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.825rem",
                            color: "var(--accent-cyan)",
                          }}
                        >
                          {purpose.code}
                        </code>
                        <button
                          onClick={() => copy(purpose.code)}
                          title="Copy purpose code"
                          className="btn-action-icon"
                          style={{ padding: "4px" }}
                        >
                          {isCopied(purpose.code) ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </TableCell>

                    {/* Expiration Status */}
                    <TableCell>
                      {purpose.expireAt ? (
                        expired ? (
                          <Badge variant="danger">
                            Expired ({formatDate(purpose.expireAt)})
                          </Badge>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Badge variant="success">
                              Active
                            </Badge>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              Expires {formatDate(purpose.expireAt)}
                            </span>
                          </div>
                        )
                      ) : (
                        <Badge variant="neutral">
                          Permanent
                        </Badge>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {formatDate(purpose.createdAt)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
                        <button
                          onClick={() => handleViewDetail(purpose)}
                          title="View purpose details"
                          className="btn-action-icon"
                          style={{ padding: "6px" }}
                        >
                          <Info size={16} />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(purpose)}
                          title="Edit purpose"
                          className="btn-action-icon"
                          style={{ padding: "6px" }}
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(purpose)}
                          title="Delete purpose"
                          className="btn-action-icon-danger"
                          style={{ padding: "6px" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE PURPOSE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSubmittingCreate && setIsCreateOpen(false)}
        title="Create New Purpose"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Purpose Name <span style={{ color: "var(--status-error)" }}>*</span>
            </label>
            <Input
              placeholder="e.g. USER_LOGIN, PASSWORD_RESET, 2FA_TRANSACTION"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
              disabled={isSubmittingCreate}
              autoFocus
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Descriptive name or intent identifier used across verification requests.
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Description (Optional)
            </label>
            <textarea
              className="custom-input"
              rows={3}
              placeholder="Provide context on when this purpose should be triggered..."
              value={createForm.description || ""}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              disabled={isSubmittingCreate}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-input, rgba(255, 255, 255, 0.03))",
                border: "1px solid var(--border-medium)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Expiration Toggle & Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={hasCreateExpiration}
                onChange={(e) => {
                  setHasCreateExpiration(e.target.checked);
                  if (!e.target.checked) {
                    setCreateForm({ ...createForm, expireAt: null });
                  }
                }}
                disabled={isSubmittingCreate}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
              />
              Set Purpose Expiration Date
            </label>

            {hasCreateExpiration && (
              <div style={{ marginTop: "0.25rem" }}>
                <Input
                  type="datetime-local"
                  value={createForm.expireAt ? createForm.expireAt.slice(0, 16) : ""}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      expireAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  leftIcon={<Calendar size={16} />}
                  disabled={isSubmittingCreate}
                />
                <span style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                  After this date, OTPs cannot be generated or validated with this purpose.
                </span>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmittingCreate}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingCreate}
            >
              Create Purpose
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PURPOSE MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => !isSubmittingEdit && setIsEditOpen(false)}
        title={editingPurpose ? `Edit Purpose: ${editingPurpose.name}` : "Edit Purpose"}
        maxWidth="500px"
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Purpose Name <span style={{ color: "var(--status-error)" }}>*</span>
            </label>
            <Input
              value={editForm.name || ""}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
              disabled={isSubmittingEdit}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Description
            </label>
            <textarea
              className="custom-input"
              rows={3}
              value={editForm.description || ""}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              disabled={isSubmittingEdit}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-input, rgba(255, 255, 255, 0.03))",
                border: "1px solid var(--border-medium)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Expiration Toggle & Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={hasEditExpiration}
                onChange={(e) => {
                  setHasEditExpiration(e.target.checked);
                  if (!e.target.checked) {
                    setEditForm({ ...editForm, expireAt: null });
                  }
                }}
                disabled={isSubmittingEdit}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
              />
              Set Purpose Expiration Date
            </label>

            {hasEditExpiration && (
              <div style={{ marginTop: "0.25rem" }}>
                <Input
                  type="datetime-local"
                  value={editForm.expireAt ? editForm.expireAt.slice(0, 16) : ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      expireAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  leftIcon={<Calendar size={16} />}
                  disabled={isSubmittingEdit}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmittingEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingEdit}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW PURPOSE DETAILS MODAL */}
      <Modal
        isOpen={!!viewingPurpose}
        onClose={() => setViewingPurpose(null)}
        title="Purpose Details"
        maxWidth="500px"
      >
        {viewingPurpose && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                padding: "1rem",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Name
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>
                  {viewingPurpose.name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Code
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2px" }}>
                  <code
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.9rem",
                      color: "var(--accent-cyan)",
                    }}
                  >
                    {viewingPurpose.code}
                  </code>
                  <button
                    onClick={() => copy(viewingPurpose.code)}
                    className="btn-action-icon"
                    style={{ padding: "4px" }}
                  >
                    {isCopied(viewingPurpose.code) ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Description
                </span>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {viewingPurpose.description || "—"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Created
                  </span>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {formatDate(viewingPurpose.createdAt)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Expires
                  </span>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {viewingPurpose.expireAt ? formatDate(viewingPurpose.expireAt) : "Never (Permanent)"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setViewingPurpose(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => !isSubmittingDelete && setIsDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        isLoading={isSubmittingDelete}
        title="Delete Purpose"
        description={
          <div>
            Are you sure you want to delete purpose{" "}
            <strong style={{ color: "var(--text-main)" }}>&ldquo;{deletingPurpose?.name}&rdquo;</strong>{" "}
            (<code>{deletingPurpose?.code}</code>)?
            <p style={{ marginTop: "0.5rem", color: "var(--status-error)", fontSize: "0.8rem" }}>
              Warning: Any OTP requests actively using this purpose identifier may fail verification.
            </p>
          </div>
        }
        confirmLabel="Yes, Delete Purpose"
        cancelLabel="Cancel"
        variant="danger"
        icon="danger"
      />
    </div>
  );
}
