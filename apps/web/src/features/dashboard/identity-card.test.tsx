import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IdentityCard } from "./identity-card";

const request = vi.hoisted(() => vi.fn());
vi.mock("./use-api", () => ({ useAuthenticatedApi: () => request }));
afterEach(() => { cleanup(); request.mockReset(); });

describe("Task Poster NIC manual review", () => {
  it("submits a valid image for manual review", async () => {
    request.mockImplementation(async (_path: string, options?: RequestInit) => options?.method === "POST"
      ? { status: "MANUAL_REVIEW_PENDING", method: "MANUAL_REVIEW", lastReviewStatus: "PENDING", lastReviewReason: null }
      : { status: "UNVERIFIED", method: null, lastReviewStatus: null, lastReviewReason: null });
    render(<IdentityCard initialStatus="UNVERIFIED" />);
    await screen.findByText("Verification Required");
    const file = new File([new Uint8Array(8)], "nic.png", { type: "image/png" });
    const drop = screen.getByText("Drag a NIC image here or click to select").closest("label")!;
    fireEvent.change(drop.querySelector('input[type="file"]')!, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Submit for Verification" }));
    await screen.findByText("Verification Pending");
    expect(request).toHaveBeenCalledWith("/api/v1/poster/identity/reviews", expect.objectContaining({ method: "POST", body: expect.any(FormData) }));
  });

  it("shows a rejection reason and allows resubmission", async () => {
    request.mockResolvedValue({ status: "REJECTED", lastReviewStatus: "REJECTED", lastReviewReason: "Image is too dark." });
    render(<IdentityCard initialStatus="REJECTED" />);
    await waitFor(() => expect(screen.getByText("Submission Rejected")).toBeInTheDocument());
    expect(screen.getByText(/Reason: Image is too dark/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit for Verification" })).toBeInTheDocument();
  });
});
