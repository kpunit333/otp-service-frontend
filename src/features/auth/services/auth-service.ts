import {
  LoginFormData,
  SignupFormData,
  OrganizationLoginResponse,
  OrganizationCreateResponse,
} from "../types/auth";
import { User } from "@/providers/auth-provider";
import { API_ENDPOINTS } from "@/constants/api";

export const authService = {
  /**
   * Authenticate Organization via POST http://localhost:5000/api/auth/o/login
   * Handles error responses gracefully and returns exact API message
   */
  async authenticate(
    data: LoginFormData
  ): Promise<{ success: boolean; user?: User; token?: string; error?: string; message?: string }> {
    const payload = {
      name: data.name.trim(),
      code: data.name.trim(),
      password: data.password,
    };

    // Helper to execute fetch with JSON error extraction
    const tryFetch = async (url: string) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      let resJson: OrganizationLoginResponse;

      if (contentType && contentType.includes("application/json")) {
        resJson = await res.json();
      } else {
        const text = await res.text();
        resJson = {
          success: res.ok,
          message: text || `HTTP ${res.status} ${res.statusText}`,
          data: null,
        };
      }

      return { status: res.status, ok: res.ok, body: resJson };
    };

    try {
      let result;
      try {
        // Try direct backend endpoint first
        result = await tryFetch(API_ENDPOINTS.ORGANIZATION_LOGIN);
      } catch (directErr) {
        console.warn("Direct backend fetch failed (likely CORS or network), trying proxy rewrite:", directErr);
        // Fallback to same-origin Next.js rewrite
        result = await tryFetch(API_ENDPOINTS.PROXY_ORGANIZATION_LOGIN);
      }

      const { ok, body } = result;

      // Check if backend signaled failure
      if (!ok || body.success === false) {
        const errorMessage =
          body.message ||
          (typeof body === "string" ? body : "Invalid organization code or password");
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Success! Extract user details and tokens
      const accessToken = body.data?.accessToken;
      const rawUser = body.data?.user || (body.data as unknown as Record<string, unknown>) || (body as unknown as Record<string, unknown>);
      const orgName = (rawUser as { name?: string })?.name || data.name;
      const orgCode = (rawUser as { code?: string })?.code || data.name;
      const orgStatus = (rawUser as { status?: string })?.status || "Active";
      const orgEmail = (rawUser as { email?: string })?.email;

      const user: User = {
        code: orgCode,
        name: orgName,
        email: orgEmail,
        status: orgStatus,
      };

      return {
        success: true,
        user,
        token: accessToken,
        message: body.message || "Organization login successful",
      };
    } catch (err: unknown) {
      console.error("AuthService login error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unable to connect to authentication service. Please check your network.",
      };
    }
  },

  /**
   * Create new organization entity via POST http://localhost:5000/api/organizations/v1/organization
   */
  async register(
    data: SignupFormData
  ): Promise<{
    success: boolean;
    organization?: OrganizationCreateResponse["data"];
    user?: User;
    error?: string;
    message?: string;
  }> {
    const payload = {
      name: data.name.trim(),
      password: data.password,
    };

    const tryFetch = async (url: string) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      let resJson: OrganizationCreateResponse;

      if (contentType && contentType.includes("application/json")) {
        resJson = await res.json();
      } else {
        const text = await res.text();
        resJson = {
          success: res.ok,
          message: text || `HTTP ${res.status} ${res.statusText}`,
          data: null,
        };
      }

      return { status: res.status, ok: res.ok, body: resJson };
    };

    try {
      let result;
      try {
        result = await tryFetch(API_ENDPOINTS.ORGANIZATION_CREATE);
      } catch (directErr) {
        console.warn("Direct organization creation failed, trying proxy rewrite:", directErr);
        result = await tryFetch(API_ENDPOINTS.PROXY_ORGANIZATION_CREATE);
      }

      const { ok, body } = result;

      if (!ok || body.success === false) {
        const errorMessage =
          body.message ||
          (typeof body === "string" ? body : "Failed to create organization entity");
        return {
          success: false,
          error: errorMessage,
        };
      }

      const orgData = body.data;
      const orgName = orgData?.name || (body as unknown as { name?: string })?.name || data.name;
      const orgCode = orgData?.code || (body as unknown as { code?: string })?.code || "";
      const orgStatus = orgData?.status || (body as unknown as { status?: string })?.status || "Active";
      const orgEmail = (orgData as { email?: string })?.email || (body as unknown as { email?: string })?.email;

      const user: User = {
        code: orgCode,
        name: orgName,
        email: orgEmail,
        status: orgStatus,
      };

      const finalOrgData = orgData || {
        name: orgName,
        code: orgCode,
        status: orgStatus,
      };

      return {
        success: true,
        organization: finalOrgData,
        user,
        message: body.message || "Organization created successfully",
      };
    } catch (err: unknown) {
      console.error("AuthService register error:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unable to connect to organization service. Please check your network.",
      };
    }
  },
};
