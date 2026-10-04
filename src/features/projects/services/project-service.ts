import { BACKEND_BASE_URL } from "@/constants/api";
import { STORAGE_KEYS } from "@/constants/storage";
import { Project, CreateProjectPayload, UpdateProjectPayload } from "@/types/project";

/**
 * Service for communicating with the Organization Project Service API
 * Endpoints:
 *   POST   http://localhost:5000/api/organizations/v1/{organizationCode}/project
 *   GET    http://localhost:5000/api/organizations/v1/{organizationCode}/project
 *   GET    http://localhost:5000/api/organizations/v1/{organizationCode}/project/{projectCode}
 *   PATCH  http://localhost:5000/api/organizations/v1/{organizationCode}/project/{projectCode}
 *   DELETE http://localhost:5000/api/organizations/v1/{organizationCode}/project/{projectCode}
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
    endpointPath: string,
    options: RequestInit = {}
  ): Promise<T> {
    const directUrl = `${BACKEND_BASE_URL}${endpointPath}`;
    const proxyUrl = endpointPath;
    const headers = { ...this.getAuthHeaders(), ...options.headers };

    let response: Response;

    try {
      // 1. Try direct backend request (e.g. http://localhost:5000/api/organizations/v1/...)
      response = await fetch(directUrl, {
        ...options,
        headers,
      });
    } catch {
      // 2. Fallback to same-origin proxy rewrite (/api/organizations/v1/...) to avoid CORS
      response = await fetch(proxyUrl, {
        ...options,
        headers,
      });
    }

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
   * GET http://localhost:5000/api/organizations/v1/{organizationCode}/project
   * Retrieves all projects belonging to the specified organization
   */
  async getProjects(organizationCode: string): Promise<Project[]> {
    if (!organizationCode) return [];
    const data = await this.request<Project[] | { projects?: Project[] }>(
      `/api/organizations/v1/${encodeURIComponent(organizationCode)}/project`,
      { method: "GET" }
    );

    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === "object" && "projects" in data && Array.isArray(data.projects)) {
      return data.projects;
    }

    return [];
  }

  /**
   * GET http://localhost:5000/api/organizations/v1/{organizationCode}/project/{projectCode}
   * Retrieves specific project data
   */
  async getProject(organizationCode: string, projectCode: string): Promise<Project> {
    return this.request<Project>(
      `/api/organizations/v1/${encodeURIComponent(organizationCode)}/project/${encodeURIComponent(projectCode)}`,
      { method: "GET" }
    );
  }

  /**
   * POST http://localhost:5000/api/organizations/v1/{organizationCode}/project
   * Creates a new project in the specified organization
   */
  async createProject(
    organizationCode: string,
    payload: CreateProjectPayload
  ): Promise<Project> {
    return this.request<Project>(
      `/api/organizations/v1/${encodeURIComponent(organizationCode)}/project`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * PATCH http://localhost:5000/api/organizations/v1/{organizationCode}/project/{projectCode}
   * Updates an existing project
   */
  async updateProject(
    organizationCode: string,
    projectCode: string,
    payload: UpdateProjectPayload
  ): Promise<Project> {
    return this.request<Project>(
      `/api/organizations/v1/${encodeURIComponent(organizationCode)}/project/${encodeURIComponent(projectCode)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * DELETE http://localhost:5000/api/organizations/v1/{organizationCode}/project/{projectCode}
   * Deletes a project from the specified organization
   */
  async deleteProject(
    organizationCode: string,
    projectCode: string
  ): Promise<void> {
    await this.request<void>(
      `/api/organizations/v1/${encodeURIComponent(organizationCode)}/project/${encodeURIComponent(projectCode)}`,
      {
        method: "DELETE",
      }
    );
  }
}

export const projectService = new ProjectService();
