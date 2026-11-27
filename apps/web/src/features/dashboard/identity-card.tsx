"use client";

import { useEffect, useState } from "react";
import type { IdentityMatchResult, IdentityVerification } from "@uniwork/api-contracts";
import { ShieldCheck, UploadCloud } from "lucide-react";
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
    if (!/[.](jpe?g|png)$/i.test(next.name) || !["image/jpeg", "image/png"].includes(next.type) || next.size > 5_000_000) { setError("Choose a JPEG or PNG image under 5 MB."); return; }
    setFile(next); setError(""); setMessage("");
  }
  async function submit(manual: boolean) {
    if (!file) { setError("Choose a NIC image first."); return; }
    setBusy(true); setError(""); setMessage("");
    const form = new FormData(); form.append("image", file);
    try {
      if (manual) {
        setState(await api<IdentityVerification>("/api/v1/poster/identity/reviews", { method: "POST", body: form }));
        setMessage("Review Submitted. Your NIC document has been sent to the UniWorkSL safety team. Check its status here.");
      } else {
        const result = await api<IdentityMatchResult>("/api/v1/poster/identity/match", { method: "POST", body: form });
        setState(result.verification);
        setMessage(result.outcome === "MATCHED" ? "NIC Matched. You can now publish new tasks." : result.outcome === "NOT_MATCHED" ? "NIC Not Matched. The document number differs from your profile. Check your profile NIC or request review when available." : "We couldn't match your NIC. Please try a clearer image with the number fully visible.");
      }
      setFile(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Verification could not be completed. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="form-section identity-card"><div className="form-section-heading"><h2>Verify Your NIC</h2><p>Upload a clear photo of your NIC to check whether its number matches your profile. This is document matching, not government identity verification. Automatic check images are discarded; manual review images are kept temporarily in private storage and deleted after a decision or expiry.</p></div>
    <div className="identity-status"><ShieldCheck size={18} aria-hidden="true" /><strong>{status === "VERIFIED" ? "NIC Matched" : status === "MANUAL_REVIEW_PENDING" ? "NIC Verification Pending" : status === "REJECTED" ? "Submission Rejected" : state?.lastReviewStatus === "EXPIRED" ? "Review Expired" : "Verification Required"}</strong></div>
    {status === "VERIFIED" ? <p>Your NIC is locked after matching. Contact support if a correction is needed.</p> : status === "MANUAL_REVIEW_PENDING" ? <p>Your document is awaiting safety team review. You can check its status here.</p> : <>
      <label className="identity-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files[0] ?? null); }}><UploadCloud size={24} aria-hidden="true" /><span>{file ? file.name : "Drag a NIC image here or click to select"}</span><small>JPEG or PNG, up to 5 MB. Keep all digits visible.</small><input type="file" accept="image/jpeg,image/png" onChange={(event) => choose(event.target.files?.[0] ?? null)} /></label>
      <div className="form-actions"><Button type="button" disabled={busy || !file} onClick={() => void submit(false)}>{busy ? "Checking…" : "Check NIC image"}</Button>{state?.manualReviewAvailable ? <Button type="button" variant="secondary" disabled={busy || !file} onClick={() => void submit(true)}>Request Manual Review</Button> : null}</div>
    </>}
    {state?.lastReviewStatus === "EXPIRED" && status === "UNVERIFIED" ? <p className="identity-message">Your previous review expired and its image was deleted. You can submit a new image.</p> : null}{message ? <p className="identity-message" role="status">{message}</p> : null}{error ? <p className="form-alert" role="alert">{error}</p> : null}
  </section>;
}
