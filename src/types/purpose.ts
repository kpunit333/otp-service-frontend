/**
 * Organization Purpose Entity Definition
 * Represents verification intent (e.g. LOGIN, PASSWORD_RESET, TRANSACTION_2FA)
 */
export interface Purpose {
  code: string;
  id?: string;
  name: string;
  description?: string;
  createdAt: string;
  expireAt?: string | null;
}

export interface CreatePurposePayload {
  name: string;
  description?: string;
  expireAt?: string | null;
}

export interface UpdatePurposePayload {
  name?: string;
  description?: string;
  expireAt?: string | null;
}

export interface PurposeApiResponse<T = Purpose | Purpose[]> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}
