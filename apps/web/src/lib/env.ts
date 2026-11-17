const defaultApiBaseUrl = "http://localhost:8080";

export function getApiBaseUrl(): string {
  const fromEnvironment = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!fromEnvironment && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be set to the deployed HTTPS API URL in production.");
  }
  const configured = fromEnvironment || defaultApiBaseUrl;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use HTTP or HTTPS.");
    if (url.username || url.password || url.search || url.hash) throw new Error("Do not include credentials, query parameters, or fragments.");
    const isLoopback = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:" && !isLoopback) {
      throw new Error("Production API requests must use HTTPS.");
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be a valid absolute HTTP(S) URL without credentials, query parameters, or fragments. Production deployments must use HTTPS.");
  }
}
