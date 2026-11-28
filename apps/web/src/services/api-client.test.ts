import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiRequest } from "./api-client";

afterEach(() => vi.unstubAllGlobals());

describe("authenticated API client", () => {
  it("sends a current bearer token and JSON headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(apiRequest<{ ok: boolean }>("/api/v1/poster/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Task" }),
      getAccessToken: async () => "unit-test-token",
    })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(request.headers).get("Authorization")).toBe("Bearer unit-test-token");
    expect(new Headers(request.headers).get("Content-Type")).toBe("application/json");
  });

  it("surfaces an unauthenticated API error without echoing the token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ status: 401, code: "UNAUTHENTICATED", message: "Authentication is required." }, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = apiRequest("/api/v1/poster/profile", { getAccessToken: async () => "secret-test-token" });
    await expect(request).rejects.toMatchObject({ status: 401, code: "UNAUTHENTICATED" } satisfies Partial<ApiRequestError>);
    await expect(request).rejects.not.toThrow("secret-test-token");
  });

  it("passes safe field validation details to the form", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      status: 400, code: "VALIDATION_FAILED", message: "One or more request fields are invalid.",
      fieldErrors: { latitude: "numeric value out of bounds" },
    }, { status: 400 })));
    await expect(apiRequest("/api/v1/poster/direct-tasks", { method: "POST", body: "{}" }))
      .rejects.toMatchObject({ code: "VALIDATION_FAILED", fieldErrors: { latitude: "numeric value out of bounds" } });
  });
});
