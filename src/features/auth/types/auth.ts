export type AuthMode = "login" | "signup";

export interface OrganizationLoginRequest {
  name?: string;
  code?: string;
  password: string;
}

export interface OrganizationCreateRequest {
  name: string;
  password: string;
}

export interface OrganizationCreateResponse {
  data: {
    id?: number | string;
    name: string;
    code: string;
    status: string;
    createdAt?: string;
  } | null;
  message: string;
  success: boolean;
  timestamp?: string;
}

export interface OrganizationLoginResponse {
  data: {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    user?: {
      name: string;
      code: string;
      status: string;
    };
    [key: string]: unknown;
  } | null;
  message: string;
  success: boolean;
  timestamp?: string;
}

export interface LoginFormData {
  name: string; // Organization code or name
  password: string;
}

export interface SignupFormData {
  name: string;
  password: string;
  confirmPassword?: string;
}
