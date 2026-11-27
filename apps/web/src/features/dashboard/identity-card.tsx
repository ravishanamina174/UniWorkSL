"use client";

import { useEffect, useState } from "react";
import type { IdentityVerification } from "@uniwork/api-contracts";
import { BadgeCheck, ShieldCheck, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthenticatedApi } from "./use-api";

export function IdentityCard({ initialStatus }: { initialStatus: string }) {
  const api = useAuthenticatedApi();
  const [state, setState] = useState<IdentityVerification | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { let active = true; void api<IdentityVerification>("/api/v1/poster/identity").then((value) => { if (active) setState(value); }).catch(() => { if (active) setError("Verification status is temporarily unavailable."); }); return () => { active = false; }; }, [api]);
  const status = state?.status ?? initialStatus;
  function choose(next: File | null) {
    if (!next) return;
    if (!["image/jpeg", "image/png"].includes(next.type) || !/[.](jpe?g|png)$/i.test(next.name) || next.size > 5_000_000) { setError("Choose a JPEG or PNG image under 5 MB."); return; }
    setFile(next); setError(""); setMessage("");
  }
  async function submit() {
    if (!file) { setError("Choose a NIC image first."); return; }
    setBusy(true); setError(""); setMessage("");
    const form = new FormData(); form.append("image", file);
    try {
      setState(await api<IdentityVerification>("/api/v1/poster/identity/reviews", { method: "POST", body: form }));
      setFile(null); setMessage("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Verification could not be submitted. Please try again."); }
    finally { setBusy(false); }
  }
  const heading = status === "VERIFIED" ? "NIC Verified" : status === "MANUAL_REVIEW_PENDING" ? "Verification Pending" : status === "REJECTED" ? "Submission Rejected" : "Verification Required";
  return <section className="form-section identity-card"><div className="form-section-heading"><h2>Verify Your NIC</h2><p>Upload a clear photo of your NIC for review by the UniWorkSL safety team. This is a document review, not government identity verification.</p></div>
    <div className={status === "VERIFIED" ? "identity-status identity-status-verified" : "identity-status"}>{status === "VERIFIED" ? <BadgeCheck size={18} aria-hidden="true" /> : <ShieldCheck size={18} aria-hidden="true" />}<strong>{heading}</strong></div>
    {status === "VERIFIED" ? <p>Your NIC was reviewed and approved. It is locked after approval.</p> : status === "MANUAL_REVIEW_PENDING" ? <p>Our team will review your NIC within 2 days. You can check the status here.</p> : <>{status === "REJECTED" && state?.lastReviewReason ? <p>Reason: {state.lastReviewReason}</p> : null}<label className="identity-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files[0] ?? null); }}><UploadCloud size={24} aria-hidden="true" /><span>{file ? file.name : "Drag a NIC image here or click to select"}</span><small>JPEG or PNG, up to 5 MB. Keep all digits visible.</small><input type="file" accept="image/jpeg,image/png" onChange={(event) => choose(event.target.files?.[0] ?? null)} /></label><div className="form-actions"><Button type="button" disabled={busy || !file} onClick={() => void submit()}>{busy ? "Submitting…" : "Submit for Verification"}</Button></div></>}
    {message ? <p className="identity-message" role="status">{message}</p> : null}{error ? <p className="form-alert" role="alert">{error}</p> : null}
  </section>;
}
