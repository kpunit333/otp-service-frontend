import {
  LoginFormData,
  SignupFormData,
  OrganizationLoginRequest,
  OrganizationLoginResponse,
  OrganizationCreateResponse,
} from "../types/auth";
import { User } from "@/providers/auth-provider";
import { API_ENDPOINTS } from "@/constants/api";

export const authService = {
  /**
   * Authenticate Organization via real API server using Code or Email
   */
  async authenticate(
    data: LoginFormData
  ): Promise<{ success: boolean; user?: User; token?: string; error?: string; message?: string }> {
    const rawIdentifier = (data.identifier || data.name || "").trim();
    const isEmail = rawIdentifier.includes("@");

    // Exact login payload required by organization service:
    // { "code": "", "email": "", "password": "" }
    const payload: OrganizationLoginRequest = {
      code: isEmail ? "" : rawIdentifier,
      email: isEmail ? rawIdentifier : "",
      password: data.password,
    };

    try {
      const res = await fetch(API_ENDPOINTS.ORGANIZATION_LOGIN, {
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

      if (!res.ok || resJson.success === false) {
        const errorMessage =
          resJson.message ||
          (typeof resJson === "string" ? resJson : "Invalid organization code, email, or password");
        return {
          success: false,
          error: errorMessage,
        };
      }

      const accessToken = resJson.data?.accessToken || resJson.data?.token;
      const rawUser =
        resJson.data?.user ||
        (resJson.data as unknown as Record<string, unknown>) ||
        (resJson as unknown as Record<string, unknown>);
      const orgId =
        (rawUser as { organization_id?: number | string })?.organization_id ||
        (rawUser as { organizationId?: number | string })?.organizationId ||
        (rawUser as { id?: number | string })?.id ||
        resJson.data?.organization_id ||
        resJson.data?.organizationId;
      const orgName = (rawUser as { name?: string })?.name || rawIdentifier;
      const orgCode = (rawUser as { code?: string })?.code || (!isEmail ? rawIdentifier : "");
      const orgStatus = (rawUser as { status?: string })?.status || "Active";
      const orgEmail = (rawUser as { email?: string })?.email || (isEmail ? rawIdentifier : undefined);

      const user: User = {
        id: orgId,
        organizationId: orgId,
        organization_id: orgId,
        code: orgCode,
        name: orgName,
        email: orgEmail,
        status: orgStatus,
      };

      return {
        success: true,
        user,
        token: accessToken,
        message: resJson.message || "Organization login successful",
      };
    } catch (err: unknown) {
      console.error("AuthService login error:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unable to connect to authentication server. Please check your network.",
      };
    }
  },

  /**
   * Create new organization entity via real API server (requires name, email, password)
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
    const payload: Record<string, string> = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
    };
    if (data.code?.trim()) {
      payload.code = data.code.trim();
    }

    try {
      const res = await fetch(API_ENDPOINTS.ORGANIZATION_CREATE, {
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

      if (!res.ok || resJson.success === false) {
        const errorMessage =
          resJson.message ||
          (typeof resJson === "string" ? resJson : "Failed to create organization entity");
        return {
          success: false,
          error: errorMessage,
        };
      }

      const orgData = resJson.data;
      const orgId =
        (orgData as { organization_id?: number | string })?.organization_id ||
        (orgData as { organizationId?: number | string })?.organizationId ||
        (orgData as { id?: number | string })?.id ||
        (resJson as unknown as { organization_id?: number | string })?.organization_id;
      const orgName = orgData?.name || (resJson as unknown as { name?: string })?.name || data.name;
      const orgCode = orgData?.code || (resJson as unknown as { code?: string })?.code || "";
      const orgStatus = orgData?.status || (resJson as unknown as { status?: string })?.status || "Active";
      const orgEmail = (orgData as { email?: string })?.email || (resJson as unknown as { email?: string })?.email || data.email;

      const user: User = {
        id: orgId,
        organizationId: orgId,
        organization_id: orgId,
        code: orgCode,
        name: orgName,
        email: orgEmail,
        status: orgStatus,
      };

      return {
        success: true,
        organization: orgData || { name: orgName, code: orgCode, email: orgEmail, status: orgStatus },
        user,
        message: resJson.message || "Organization created successfully",
      };
    } catch (err: unknown) {
      console.error("AuthService register error:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unable to connect to organization server. Please check your network.",
      };
    }
  },
};
