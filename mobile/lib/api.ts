import { useAuthStore } from "../store/authStore";
import { SERVER_URL, USE_API } from "./config";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};

/**
 * Base API client that prepends SERVER_URL and injects the auth token.
 * Throws if called when USE_API is false — callers should check first.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!USE_API) {
    throw new Error(
      "apiFetch called without a SERVER_URL configured. This is a bug.",
    );
  }

  const { method = "GET", body, headers = {} } = options;
  const token = useAuthStore.getState().token;

  const res = await fetch(`${SERVER_URL}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(
      errorBody.error || `Request failed (${res.status})`,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
