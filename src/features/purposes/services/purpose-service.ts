import { API_ENDPOINTS } from "@/constants/api";
import { STORAGE_KEYS } from "@/constants/storage";
import {
  Purpose,
  CreatePurposePayload,
  UpdatePurposePayload,
} from "@/types/purpose";

/**
 * Service for communicating with the Organization Purpose Service API on the real API server
 */
class PurposeService {
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
          : `Purpose Service API error: ${response.status} ${response.statusText}`;
      const err = new Error(errorMsg);
      (err as unknown as { status: number }).status = response.status;
      throw err;
    }

    // Handle standard Spring Boot response wrappers: { data: ..., message: ..., success: true }
    if (typeof parsedData === "object" && parsedData !== null && "data" in parsedData) {
      return (parsedData as { data: T }).data;
    }

    return parsedData as T;
  }

  /**
   * Normalizes a raw purpose entity into the standard Purpose interface
   */
  private normalizePurpose(item: unknown): Purpose {
    const p = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    return {
      code: String(p.code || ""),
      name: String(p.name || ""),
      description: p.description ? String(p.description) : "",
      createdAt: String(p.createdAt || new Date().toISOString()),
      expireAt: p.expireAt ? String(p.expireAt) : null,
    };
  }

  /**
   * Retrieves all purposes belonging to the specified organization
   * GET /api/organizations/v1/{organizationCode}/purpose
   */
  async getPurposes(organizationCode: string): Promise<Purpose[]> {
    if (!organizationCode) return [];
    const url = API_ENDPOINTS.ORGANIZATION_PURPOSES(organizationCode);
    const res = await this.request<unknown>(url, { method: "GET" });

    let rawList: unknown[] = [];
    if (Array.isArray(res)) {
      rawList = res;
    } else if (typeof res === "object" && res !== null) {
      const record = res as Record<string, unknown>;
      if (Array.isArray(record.data)) {
        rawList = record.data;
      } else if (Array.isArray(record.purposes)) {
        rawList = record.purposes;
      }
    }

    return rawList.map((item) => this.normalizePurpose(item));
  }

  /**
   * Retrieves details of a specific purpose
   * GET /api/organizations/v1/{organizationCode}/purpose/{purposeCode}
   */
  async getPurpose(organizationCode: string, purposeCode: string): Promise<Purpose> {
    const url = API_ENDPOINTS.ORGANIZATION_PURPOSE_DETAIL(organizationCode, purposeCode);
    const res = await this.request<unknown>(url, { method: "GET" });
    return this.normalizePurpose(res);
  }

  /**
   * Creates a new purpose for the specified organization
   * POST /api/organizations/v1/{organizationCode}/purpose/ or /purpose
   */
  async createPurpose(
    organizationCode: string,
    payload: CreatePurposePayload
  ): Promise<Purpose> {
    const baseUrl = API_ENDPOINTS.ORGANIZATION_PURPOSES(organizationCode);
    // User specification states: POST /api/organizations/v1/{organizationCode}/purpose/
    const targetUrl = `${baseUrl}/`;

    const body: Record<string, unknown> = {
      name: payload.name.trim(),
    };
    if (payload.description !== undefined) {
      body.description = payload.description.trim();
    }
    if (payload.expireAt !== undefined) {
      body.expireAt = payload.expireAt;
    }

    try {
      const res = await this.request<unknown>(targetUrl, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return this.normalizePurpose(res);
    } catch (err: unknown) {
      // If trailing slash caused 404, fallback to endpoint without trailing slash
      if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
        const fallbackRes = await this.request<unknown>(baseUrl, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return this.normalizePurpose(fallbackRes);
      }
      throw err;
    }
  }

  /**
   * Updates an existing purpose entity
   * PATCH /api/organizations/v1/{organizationCode}/purpose/{purposeCode}
   */
  async updatePurpose(
    organizationCode: string,
    purposeCode: string,
    payload: UpdatePurposePayload
  ): Promise<Purpose> {
    const url = API_ENDPOINTS.ORGANIZATION_PURPOSE_DETAIL(organizationCode, purposeCode);
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) {
      body.name = payload.name.trim();
    }
    if (payload.description !== undefined) {
      body.description = payload.description.trim();
    }
    if (payload.expireAt !== undefined) {
      body.expireAt = payload.expireAt;
    }

    const res = await this.request<unknown>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return this.normalizePurpose(res);
  }

  /**
   * Deletes a specific purpose entity
   * DELETE /api/organizations/v1/{organizationCode}/purpose/{purposeCode}
   */
  async deletePurpose(organizationCode: string, purposeCode: string): Promise<void> {
    const url = API_ENDPOINTS.ORGANIZATION_PURPOSE_DETAIL(organizationCode, purposeCode);
    await this.request(url, { method: "DELETE" });
  }
}

export const purposeService = new PurposeService();
