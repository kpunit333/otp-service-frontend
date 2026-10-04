import { ApiResponse } from "@/types/api";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  retries?: number;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = "API_ERROR", status = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Resilient API Client with automatic JSON parsing, query string handling,
 * request timeouts, and exponential backoff retry.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    body,
    params,
    timeoutMs = 10000,
    retries = 1,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  // Build query string
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts <= retries) {
    attempts++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...defaultHeaders,
          ...customHeaders,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorData = (data as ApiResponse)?.error;
        throw new ApiError(
          errorData?.message || `Request failed with status ${response.status}`,
          errorData?.code || `HTTP_${response.status}`,
          response.status,
          errorData?.details
        );
      }

      // If response follows standard ApiResponse<T>, unwrap data when present
      if (isJson && typeof data === "object" && data !== null && "data" in data) {
        return (data as ApiResponse<T>).data as T;
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";
      const error = isAbort
        ? new ApiError(`Request timed out after ${timeoutMs}ms`, "TIMEOUT", 408)
        : err instanceof ApiError
        ? err
        : new ApiError(err instanceof Error ? err.message : "Unknown network error", "NETWORK_ERROR");

      lastError = error;

      // Only retry on network errors or 5xx server errors
      if (attempts <= retries && (!(error instanceof ApiError) || error.status >= 500)) {
        await new Promise((res) => setTimeout(res, attempts * 500));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new ApiError("Maximum retries reached", "RETRY_EXHAUSTED");
}
