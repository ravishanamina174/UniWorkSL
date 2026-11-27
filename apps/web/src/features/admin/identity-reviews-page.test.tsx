import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IdentityReviewsPage } from "./identity-reviews-page";

const request = vi.hoisted(() => vi.fn());
const getToken = vi.hoisted(() => vi.fn(async () => "test-token"));
vi.mock("@clerk/nextjs", () => ({ useAuth: () => ({ getToken }) }));
vi.mock("@/features/dashboard/use-api", () => ({ useAuthenticatedApi: () => request }));
vi.mock("@/lib/env", () => ({ getApiBaseUrl: () => "http://localhost:18080" }));
const review = { reviewId: "00000000-0000-0000-0000-000000000001", userId: "user", name: "Test Student", userType: "STUDENT", maskedNic: "••••••••0275", status: "PENDING", verificationStatus: "MANUAL_REVIEW_PENDING", submittedAt: "2026-11-28T00:00:00Z", expiresAt: "2026-12-28T00:00:00Z", decidedAt: null, decisionReason: null, unsuccessfulAttempts: 2 };
afterEach(() => { cleanup(); request.mockReset(); vi.unstubAllGlobals(); });

describe("Admin identity review", () => {
  it("requires a reason and posts an approval after loading the private image", async () => {
    request.mockImplementation(async (path: string) => path.includes("/approve") ? review : { content: [review], page: 0, size: 20, totalElements: 1, totalPages: 1 });
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, blob: async () => new Blob(["image"], { type: "image/jpeg" }) })));
    vi.stubGlobal("confirm", vi.fn(() => true));
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:test-nic"), revokeObjectURL: vi.fn() });
    render(<IdentityReviewsPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Test Student/ }));
    await screen.findByAltText("Private NIC document submitted for this review");
    expect(screen.getByRole("button", { name: "Approve NIC Match" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Decision reason"), { target: { value: "Number and name matched" } });
    fireEvent.click(screen.getByRole("button", { name: "Approve NIC Match" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.stringContaining("/approve"), expect.objectContaining({ method: "POST", body: JSON.stringify({ reason: "Number and name matched" }) })));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/image"), expect.objectContaining({ cache: "no-store" }));
  });
});
