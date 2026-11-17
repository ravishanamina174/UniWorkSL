import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DownloadSection, getApkUrl } from "./download-section";

afterEach(() => { cleanup(); });

describe("student app download", () => {
  it("does not show a broken link or QR when the APK URL is missing", () => {
    delete process.env.NEXT_PUBLIC_ANDROID_APK_URL;
    render(<DownloadSection />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByText("The APK and QR code will appear here when ready.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /download student app/i })).not.toBeInTheDocument();
    expect(document.querySelector("svg[role='img']")).not.toBeInTheDocument();
  });

  it("renders the download link and matching QR code for a secure APK URL", () => {
    process.env.NEXT_PUBLIC_ANDROID_APK_URL = "https://downloads.example.org/uniwork.apk";
    render(<DownloadSection />);
    expect(screen.getByRole("link", { name: /download student app/i })).toHaveAttribute("href", process.env.NEXT_PUBLIC_ANDROID_APK_URL);
    expect(screen.getByTitle("Scan to download the UniWork student Android app")).toBeInTheDocument();
  });

  it("rejects non-HTTPS APK URLs", () => {
    expect(getApkUrl({ NEXT_PUBLIC_ANDROID_APK_URL: "http://downloads.example.org/app.apk" })).toBeNull();
  });
});
