import type { ApiError } from "@uniwork/api-contracts";
import { getApiBaseUrl } from "@/lib/env";

export class ApiRequestError extends Error {
  constructor(public readonly status: number, message: string, public readonly code = "REQUEST_FAILED", public readonly fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  getAccessToken?: () => Promise<string | null>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { getAccessToken, headers: suppliedHeaders, ...init } = options;
  const headers = new Headers(suppliedHeaders);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = await getAccessToken?.();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(new URL(path.replace(/^\//, ""), `${getApiBaseUrl()}/`), { ...init, headers });
  } catch {
    throw new ApiRequestError(0, "The UniWork API could not be reached.", "API_UNAVAILABLE");
  }

  if (!response.ok) {
    let body: Partial<ApiError> = {};
    try { body = await response.json() as Partial<ApiError>; } catch { /* non-JSON response */ }
    throw new ApiRequestError(response.status, body.message || `Request failed (${response.status}).`, body.code,
      (body as Partial<ApiError> & { fieldErrors?: Record<string, string> }).fieldErrors ?? {});
  }
  return await response.json() as T;
}
