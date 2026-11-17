import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBaseUrl } from "./env";

afterEach(() => vi.unstubAllEnvs());

describe("API base URL configuration", () => {
  it("uses localhost only outside production when no URL is configured", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(getApiBaseUrl()).toBe("http://localhost:8080");
  });

  it("requires an explicit API URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(() => getApiBaseUrl()).toThrow(/must be set/i);
  });

  it("requires HTTPS for non-loopback production endpoints", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.uniwork.lk");
    expect(() => getApiBaseUrl()).toThrow(/HTTPS/i);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.uniwork.lk");
    expect(getApiBaseUrl()).toBe("https://api.uniwork.lk");
  });

  it("rejects embedded credentials and URL parameters", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://user:secret@api.uniwork.lk");
    expect(() => getApiBaseUrl()).toThrow(/valid absolute HTTP\(S\) URL/i);
  });
});
