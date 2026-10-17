import { API_ENDPOINTS } from "@/constants/api";
import { STORAGE_KEYS } from "@/constants/storage";
import { Project, CreateProjectPayload, UpdateProjectPayload } from "@/types/project";

/**
 * Service for communicating with the Organization Project Service API on the real API server
 */
class ProjectService {
  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = { ...this.getAuthHeaders(), ...options.headers };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";
    let parsedData: unknown = null;

    if (contentType.includes("application/json")) {
      parsedData = await response.json();
    } else {
      const text = await response.text();
      try {
        parsedData = JSON.parse(text);
      } catch {
        parsedData = text;
      }
    }

    if (!response.ok) {
      const errorMsg =
        typeof parsedData === "object" && parsedData !== null && "message" in parsedData
          ? String((parsedData as { message: unknown }).message)
          : typeof parsedData === "string" && parsedData.length > 0
          ? parsedData
          : `Project Service API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMsg);
    }

    // Handle common Spring Boot response wrappers: { data: ... } or direct data
    if (typeof parsedData === "object" && parsedData !== null && "data" in parsedData) {
      return (parsedData as { data: T }).data;
    }

    return parsedData as T;
  }

  /**
   * Retrieves all projects belonging to the specified organization from real API server
   */
  async getProjects(organizationCode: string): Promise<Project[]> {
    if (!organizationCode) return [];
    const url = API_ENDPOINTS.ORGANIZATION_PROJECTS(organizationCode);
    const res = await this.request<unknown>(url, { method: "GET" });

    let rawList: unknown[] = [];
    if (Array.isArray(res)) {
      rawList = res;
    } else if (typeof res === "object" && res !== null) {
      const record = res as Record<string, unknown>;
      if (Array.isArray(record.data)) {
        rawList = record.data;
      } else if (Array.isArray(record.projects)) {
        rawList = record.projects;
      }
    }

    return rawList.map((item) => {
      const p = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
      return {
        code: String(p.code || ""),
        name: String(p.name || ""),
        email: String(p.email || ""),
        secretKey: String(p.secretKey || ""),
        status: String(p.status || "Active"),
        description: p.description ? String(p.description) : "",
        createdAt: String(p.createdAt || new Date().toISOString()),
        expireAt: p.expireAt ? String(p.expireAt) : undefined,
      };
    });
  }

  /**
   * Creates a new project entity on real API server
   */
  async createProject(organizationCode: string, payload: CreateProjectPayload): Promise<Project> {
    const url = API_ENDPOINTS.ORGANIZATION_PROJECTS(organizationCode);
    const body = {
      name: payload.name.trim(),
      password: payload.password,
      email: payload.email.trim(),
      description: payload.description ? payload.description.trim() : "",
    };
    return this.request<Project>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Updates an existing project entity on real API server
   */
  async updateProject(
    organizationCode: string,
    projectCode: string,
    payload: UpdateProjectPayload
  ): Promise<Project> {
    const url = API_ENDPOINTS.ORGANIZATION_PROJECT_DETAIL(organizationCode, projectCode);
    return this.request<Project>(url, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Deletes a project entity on real API server
   */
  async deleteProject(organizationCode: string, projectCode: string): Promise<void> {
    const url = API_ENDPOINTS.ORGANIZATION_PROJECT_DETAIL(organizationCode, projectCode);
    await this.request(url, { method: "DELETE" });
  }
}

export const projectService = new ProjectService();
