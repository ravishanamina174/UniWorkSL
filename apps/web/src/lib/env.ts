const defaultApiBaseUrl = "http://localhost:8080";

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || defaultApiBaseUrl;
  try {
    return new URL(configured).toString().replace(/\/$/, "");
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  }
}
