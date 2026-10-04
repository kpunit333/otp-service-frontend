"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Project, CreateProjectPayload, UpdateProjectPayload } from "@/types/project";
import { projectService } from "../services/project-service";
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
  FolderKanban,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Key,
  Calendar,
  AlertTriangle,
  Layers,
  Building2,
  Sparkles,
} from "lucide-react";

export function ProjectList() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { copy, isCopied } = useClipboard();

  // Active organization code (from session or custom prompt)
  const [orgCode, setOrgCode] = useState<string>(user?.code || "");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Secret Key Visibility Toggle State
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Create Project Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreateProjectPayload>({
    name: "",
    description: "",
    status: "Active",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  // Edit Project Modal State
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<UpdateProjectPayload>({
    name: "",
    description: "",
    status: "Active",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false);

  // Sync orgCode if user updates in session
  useEffect(() => {
    if (user?.code && !orgCode) {
      setOrgCode(user.code);
    }
  }, [user?.code, orgCode]);

  // Load Projects from API
  const loadProjects = async (silent = false) => {
    const currentOrg = orgCode.trim() || user?.code || "";
    if (!currentOrg) {
      setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await projectService.getProjects(currentOrg);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve projects";
      console.warn("Project fetch error:", msg);
      showToast(msg, "warning", "Organization Service");
      // Keep existing list or initialize empty
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [orgCode]);

  // Toggle secret visibility for a specific project
  const toggleSecretVisibility = (projectCode: string) => {
    setRevealedSecrets((prev) => ({
      ...prev,
      [projectCode]: !prev[projectCode],
    }));
  };

  // Handle Create Project Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentOrg = orgCode.trim() || user?.code;
    if (!currentOrg) {
      showToast("Organization code is required to create a project.", "warning");
      return;
    }
    if (!createForm.name.trim()) {
      showToast("Project name is required.", "warning");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const created = await projectService.createProject(currentOrg, {
        name: createForm.name.trim(),
        description: createForm.description?.trim() || undefined,
        status: createForm.status || "Active",
      });

      showToast(`Project '${created.name || createForm.name}' created successfully`, "success", "Project Provisioned");
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "", status: "Active" });
      loadProjects(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create project";
      showToast(msg, "error", "Creation Failed");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Handle Edit Project Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const currentOrg = orgCode.trim() || user?.code;
    if (!currentOrg) return;

    setIsSubmittingEdit(true);
    try {
      await projectService.updateProject(currentOrg, editingProject.code, {
        name: editForm.name?.trim(),
        description: editForm.description?.trim(),
        status: editForm.status,
      });

      // Optimistically update project in state
      setProjects((prev) =>
        prev.map((item) =>
          item.code === editingProject.code
            ? {
                ...item,
                name: editForm.name?.trim() || item.name,
                description: editForm.description?.trim(),
                status: editForm.status || item.status,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      showToast("Project updated successfully", "success", "Success");
      setIsEditOpen(false);
      setEditingProject(null);
      loadProjects(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update project";
      showToast(msg, "error", "Update Failed");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Project Submit
  const handleDeleteSubmit = async () => {
    if (!deletingProject) return;
    const currentOrg = orgCode.trim() || user?.code;
    if (!currentOrg) return;

    setIsSubmittingDelete(true);
    try {
      await projectService.deleteProject(currentOrg, deletingProject.code);
      showToast(`Project '${deletingProject.name}' (${deletingProject.code}) deleted.`, "info", "Project Removed");
      setIsDeleteOpen(false);
      setDeletingProject(null);
      loadProjects(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
      showToast(msg, "error", "Deletion Failed");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Filtered project list
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "ACTIVE") return <Badge variant="success">Active</Badge>;
    if (s === "INACTIVE") return <Badge variant="warning">Inactive</Badge>;
    if (s === "SUSPENDED" || s === "REVOKED") return <Badge variant="danger">{status}</Badge>;
    return <Badge variant="neutral">{status || "Unknown"}</Badge>;
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
            <FolderKanban size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Organization Projects</h2>
              <Badge variant="primary">{filteredProjects.length} Projects</Badge>
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
            onClick={() => loadProjects(true)}
            disabled={isRefreshing}
            leftIcon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
            title="Reload from API"
          >
            Refresh
          </Button>

          {/* Create Project Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Input
            placeholder="Search by project name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} color="var(--text-muted)" />}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: "40px",
            padding: "0 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-medium)",
            color: "var(--text-main)",
            fontSize: "0.875rem",
            fontFamily: "var(--font-sans)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Projects Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader style={{ width: "14%" }}>Project Name</TableHeader>
              <TableHeader style={{ width: "15%" }}>Project Code</TableHeader>
              <TableHeader style={{ width: "20%" }}>Secret Key</TableHeader>
              <TableHeader style={{ width: "10%" }}>Status</TableHeader>
              <TableHeader style={{ width: "22%" }}>Description</TableHeader>
              <TableHeader style={{ width: "13%", whiteSpace: "nowrap" }}>Created Date</TableHeader>
              <TableHeader style={{ width: "6%", textAlign: "right" }}>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <RefreshCw size={24} className="animate-spin" color="var(--primary)" />
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      Querying projects from organization service...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: "center", padding: "3.5rem 1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem", maxWidth: "420px", margin: "0 auto" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)",
                        border: "1px solid rgba(99, 102, 241, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-light)",
                        boxShadow: "0 0 24px rgba(99, 102, 241, 0.2)",
                      }}
                    >
                      <Layers size={30} />
                    </div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>No Projects Found</h4>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                      {searchQuery
                        ? "No projects match your active search and filter criteria."
                        : "No projects have been provisioned under organization yet."}
                    </p>
                    {!searchQuery && (
                      <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="create-first-project-btn"
                        style={{ marginTop: "0.75rem" }}
                        title="Provision a new project in your organization"
                      >
                        <Plus size={18} className="btn-plus-icon" />
                        <span>Create Your First Project</span>
                        <Sparkles size={16} className="btn-sparkle-icon" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => {
                const isSecretRevealed = !!revealedSecrets[project.code];
                const secretValue = project.secretKey || "sec_live_default_key_placeholder";

                return (
                  <TableRow key={project.code}>
                    {/* Project Name */}
                    <TableCell>
                      <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.925rem" }}>
                        {project.name}
                      </span>
                    </TableCell>

                    {/* Project Code */}
                    <TableCell>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
                        <code
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: "var(--accent-cyan)",
                            border: "1px solid var(--border-subtle)",
                            fontWeight: 600,
                          }}
                        >
                          {project.code}
                        </code>
                        <button
                          type="button"
                          onClick={() => copy(project.code, `code-${project.code}`)}
                          title="Copy project code"
                          className="btn-action-icon"
                          style={{ padding: "3px 5px" }}
                        >
                          {isCopied(`code-${project.code}`) ? (
                            <Check size={12} color="var(--accent-emerald)" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Secret Key with Reveal & Copy */}
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <code
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "rgba(0, 0, 0, 0.35)",
                            border: "1px solid var(--border-subtle)",
                            color: isSecretRevealed ? "var(--accent-emerald)" : "var(--text-muted)",
                            maxWidth: "160px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isSecretRevealed ? secretValue : "••••••••••••••••••••"}
                        </code>
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(project.code)}
                          title={isSecretRevealed ? "Hide secret key" : "Reveal secret key"}
                          className="btn-action-icon"
                          style={{ padding: "5px" }}
                        >
                          {isSecretRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copy(secretValue, `secret-${project.code}`)}
                          title="Copy secret key to clipboard"
                          className="btn-action-icon"
                          style={{ padding: "5px" }}
                        >
                          {isCopied(`secret-${project.code}`) ? (
                            <Check size={14} color="var(--accent-emerald)" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(project.status)}</TableCell>

                    {/* Description */}
                    <TableCell>
                      <span
                        style={{
                          fontSize: "0.825rem",
                          color: project.description ? "var(--text-secondary)" : "var(--text-muted)",
                          fontStyle: project.description ? "normal" : "italic",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {project.description || "No description provided"}
                      </span>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.825rem",
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Calendar size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: "nowrap" }}>{formatDate(project.createdAt)}</span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProject(project);
                            setEditForm({
                              name: project.name,
                              description: project.description || "",
                              status: project.status || "Active",
                            });
                            setIsEditOpen(true);
                          }}
                          title="Edit project"
                          className="btn-action-icon"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeletingProject(project);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete project"
                          className="btn-action-icon-danger"
                        >
                          <Trash2 size={14} />
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

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSubmittingCreate && setIsCreateOpen(false)}
        title="Provision New Project"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
              Project Name *
            </label>
            <Input
              required
              placeholder="e.g. Mobile Banking App, Checkout Service"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
              Description
            </label>
            <textarea
              placeholder="Brief details about what this project or microservice does..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-sans)",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
              Initial Status
            </label>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
              style={{
                width: "100%",
                height: "42px",
                padding: "0 0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-sans)",
                outline: "none",
              }}
            >
              <option value="Active">Active (Provisioning Secret Key)</option>
              <option value="Inactive">Inactive (Suspended)</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
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
              leftIcon={<Plus size={16} />}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PROJECT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => !isSubmittingEdit && setIsEditOpen(false)}
        title={`Edit Project: ${editingProject?.name || ""}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
              Project Code
            </label>
            <Input
              disabled
              value={editingProject?.code || ""}
              style={{ opacity: 0.6, cursor: "not-allowed", fontFamily: "var(--font-mono)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
              Project Name *
            </label>
            <Input
              required
              value={editForm.name || ""}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
              Description
            </label>
            <textarea
              value={editForm.description || ""}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-sans)",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block" }}>
              Status
            </label>
            <select
              value={editForm.status || "Active"}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              style={{
                width: "100%",
                height: "42px",
                padding: "0 0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-sans)",
                outline: "none",
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
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

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => !isSubmittingDelete && setIsDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        title={`Delete Project: ${deletingProject?.name || ""}`}
        description={
          <span>
            Are you sure you want to permanently delete project{" "}
            <code style={{ color: "var(--accent-rose)", fontFamily: "var(--font-mono)" }}>
              {deletingProject?.code}
            </code>? This action is irreversible and will revoke its secret key immediately.
          </span>
        }
        confirmLabel="Delete Project"
        cancelLabel="Cancel"
        variant="danger"
        icon="danger"
        isLoading={isSubmittingDelete}
      />
    </div>
  );
}
