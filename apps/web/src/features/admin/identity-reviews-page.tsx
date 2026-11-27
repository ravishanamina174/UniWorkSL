"use client";
/* eslint-disable @next/next/no-img-element -- Private authenticated blob URLs cannot use the image optimizer. */

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import type { PageResponse } from "@uniwork/api-contracts";
import { getApiBaseUrl } from "@/lib/env";
import { useAuthenticatedApi } from "@/features/dashboard/use-api";

type Review = { reviewId: string; userId: string; name: string; userType: string; maskedNic: string; status: string; verificationStatus: string; submittedAt: string; expiresAt: string; decidedAt: string | null; decisionReason: string | null; unsuccessfulAttempts: number };
const format = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, (first) => first.toUpperCase());

export function IdentityReviewsPage() {
  const api = useAuthenticatedApi();
  const { getToken } = useAuth();
  const [rows, setRows] = useState<PageResponse<Review> | null>(null);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selected, setSelected] = useState<Review | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [comparisonNic, setComparisonNic] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), size: "20", status });
    if (appliedSearch) params.set("search", appliedSearch);
    try { setRows(await api<PageResponse<Review>>(`/api/v1/admin/identity-reviews?${params}`)); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Reviews could not be loaded."); }
  }, [api, page, status, appliedSearch]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load, refresh]);
  useEffect(() => {
    if (!selected || selected.status !== "PENDING") return;
    let active = true; let url: string | null = null;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Sign in again to view this document.");
        const response = await fetch(`${getApiBaseUrl()}/api/v1/admin/identity-reviews/${selected.reviewId}/image`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!response.ok) throw new Error("The private document could not be loaded.");
        const blob = await response.blob();
        if (!active) return;
        url = URL.createObjectURL(blob); setImage(url);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "The document could not be loaded."); }
    })();
    return () => { active = false; if (url) URL.revokeObjectURL(url); setImage(null); };
  }, [selected, getToken]);
  async function revealNic() {
    if (!selected) return;
    try { const result = await api<{ profileNic: string }>(`/api/v1/admin/identity-reviews/${selected.reviewId}/comparison`); setComparisonNic(result.profileNic); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The profile NIC could not be loaded."); }
  }
  async function decide(approve: boolean) {
    if (!selected || !reason.trim()) { setError("Enter a decision reason."); return; }
    if (!window.confirm(`${approve ? "Approve this NIC match" : "Reject this submission"}? This decision is recorded in the audit log.`)) return;
    setBusy(true); setError("");
    try {
      await api(`/api/v1/admin/identity-reviews/${selected.reviewId}/${approve ? "approve" : "reject"}`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
      setSelected(null); setReason(""); setRefresh((value) => value + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The decision could not be saved."); }
    finally { setBusy(false); }
  }
  return <div className="admin-page"><header className="admin-heading"><p>DOCUMENT MATCHING</p><h1>Identity Reviews</h1><span>Review NIC documents submitted after unsuccessful automatic matching.</span></header>
    {error ? <div className="admin-error" role="alert">{error} <button onClick={() => void load()}>Retry</button></div> : null}
    <form className="admin-filters" onSubmit={(event) => { event.preventDefault(); setPage(0); setAppliedSearch(search.trim()); }}><label><input aria-label="Search reviews by name" placeholder="Search by name" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Review status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>{["PENDING", "APPROVED", "REJECTED", "EXPIRED"].map((value) => <option key={value} value={value}>{format(value)}</option>)}</select><button type="submit">Search</button></form>
    {!rows && !error ? <p>Loading identity reviews…</p> : rows?.content.length ? <div className="identity-review-list">{rows.content.map((review) => <button className="identity-review-row" key={review.reviewId} onClick={() => { setSelected(review); setComparisonNic(null); setReason(""); setError(""); }}><span><strong>{review.name}</strong><small>{format(review.userType)} · {review.maskedNic}</small></span><span>{new Date(review.submittedAt).toLocaleDateString("en-LK")}</span><span>{format(review.verificationStatus)}</span><span>{format(review.status)}</span><span>Review →</span></button>)}</div> : <div className="admin-empty"><strong>No reviews found</strong><p>New requests will appear here.</p></div>}
    {rows ? <div className="pagination-bar"><span>{rows.totalElements} reviews</span><button disabled={page===0} onClick={() => setPage(page-1)}>Previous</button><span>Page {page+1} of {Math.max(rows.totalPages,1)}</span><button disabled={page+1>=rows.totalPages} onClick={() => setPage(page+1)}>Next</button></div> : null}
    {selected ? <section className="identity-review-detail" aria-label="Identity review details"><div className="form-section-heading"><h2>{selected.name}</h2><button onClick={() => { setSelected(null); setComparisonNic(null); }} aria-label="Close review">✕</button></div><p>{format(selected.userType)} · Profile NIC {selected.maskedNic} · {selected.unsuccessfulAttempts} prior unsuccessful attempts</p><p>Submitted {new Date(selected.submittedAt).toLocaleString("en-LK")}. Expires {new Date(selected.expiresAt).toLocaleString("en-LK")}.</p>{selected.status === "PENDING" ? <>{image ? <img src={image} alt="Private NIC document submitted for this review" className="identity-review-image" /> : <p>Loading private image…</p>}<button onClick={() => void revealNic()}>{comparisonNic ? "Refresh profile NIC" : "Reveal profile NIC for comparison"}</button>{comparisonNic ? <p>Profile NIC: <strong>{comparisonNic}</strong></p> : null}<label className="form-field"><span>Decision reason</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={2000} rows={3} /></label><div className="form-actions"><button disabled={busy || !image || !reason.trim()} onClick={() => void decide(false)}>Reject Submission</button><button disabled={busy || !image || !reason.trim()} onClick={() => void decide(true)}>Approve NIC Match</button></div></> : <p>Decision: {selected.decisionReason || format(selected.status)}</p>}</section> : null}
  </div>;
}
