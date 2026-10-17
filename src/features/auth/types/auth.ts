export type AuthMode = "login" | "signup";

export interface OrganizationLoginRequest {
  code: string;
  email: string;
  password: string;
}

export interface OrganizationCreateRequest {
  name: string;
  email: string;
  password: string;
  code?: string;
}

export interface OrganizationCreateResponse {
  data: {
    organization_id?: number | string;
    organizationId?: number | string;
    id?: number | string;
    name: string;
    code: string;
    email?: string;
    status: string;
    created_at?: string;
    createdAt?: string;
    expire_at?: string;
    expiry_at?: string;
  } | null;
  message: string;
  success: boolean;
  timestamp?: string;
}

export interface OrganizationLoginResponse {
  data: {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    organization_id?: number | string;
    organizationId?: number | string;
    user?: {
      organization_id?: number | string;
      organizationId?: number | string;
      id?: number | string;
      name: string;
      code: string;
      email?: string;
      status: string;
    };
    [key: string]: unknown;
  } | null;
  message: string;
  success: boolean;
  timestamp?: string;
}

export interface LoginFormData {
  identifier?: string; // Organization code or email
  name?: string; // Backward compatibility alias
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  code?: string;
}

