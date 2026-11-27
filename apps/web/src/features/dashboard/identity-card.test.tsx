import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IdentityCard } from "./identity-card";

const request = vi.hoisted(() => vi.fn());
vi.mock("./use-api", () => ({ useAuthenticatedApi: () => request }));
afterEach(() => { cleanup(); request.mockReset(); });

describe("Task Poster NIC matching", () => {
  it("shows the server status and manual review after two failed checks", async () => {
    request.mockImplementation(async (path: string) => path.endsWith("/match")
      ? { outcome: "UNREADABLE", verification: { status: "UNVERIFIED", unsuccessfulAttempts: 2, manualReviewAvailable: true } }
      : { status: "UNVERIFIED", unsuccessfulAttempts: 1, manualReviewAvailable: false });
    render(<IdentityCard initialStatus="UNVERIFIED" />);
    await screen.findByText("Verification Required");
    const file = new File([new Uint8Array(8)], "nic.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/drag a nic image/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Check NIC image" }));
    await screen.findByRole("button", { name: "Request Manual Review" });
    expect(request).toHaveBeenCalledWith("/api/v1/poster/identity/match", expect.objectContaining({ method: "POST", body: expect.any(FormData) }));
  });

  it("reports expired reviews and lets users submit a new image", async () => {
    request.mockResolvedValue({ status: "UNVERIFIED", lastReviewStatus: "EXPIRED", unsuccessfulAttempts: 2, manualReviewAvailable: true });
    render(<IdentityCard initialStatus="UNVERIFIED" />);
    await waitFor(() => expect(screen.getByText("Review Expired")).toBeInTheDocument());
    expect(screen.getByText(/previous review expired/)).toBeInTheDocument();
  });
});
