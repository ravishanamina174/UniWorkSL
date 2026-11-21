"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Activity, ArrowRight, BriefcaseBusiness, FileWarning, MapPin, Search, ShieldAlert, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { PageResponse } from "@uniwork/api-contracts";
import { useAuthenticatedApi } from "@/features/dashboard/use-api";
import { AdminTaskMap, type MapTask } from "./admin-map";

type Section = "dashboard" | "tasks" | "watchlist" | "disputes" | "cases" | "audit-logs";
type Overview = { ongoingTasks: number; activeSafeTaskSessions: number; flaggedPosters: number; openPaymentDisputes: number; unresolvedSafetyReports: number; casesRequiringReview: number; startedTasks: number; otherOngoingTasks: number; resolvedDisputes: number };
type ActiveTask = MapTask & { startedAt: string; posterName: string; posterUserId: string; studentName: string; studentUserId: string; safeTaskStatus: string };
type Watch = { posterUserId: string; posterName: string; status: string; flaggedAt: string; lastSignalAt: string; decisionReason: string | null; averageRating: number; totalReviews: number; oneStarReviews: number; twoStarReviews: number; seriousReports: number; completedTasks: number; paymentDisputes: number };
type Dispute = { disputeId: string; taskId: string; taskTitle: string; studentName: string; posterName: string; agreedAmountLkr: number; actualAmountLkr: number | null; reason: string; studentStatement: string; posterResponse: string | null; posterSaysPaid: boolean | null; status: string; outcome: string | null; createdAt: string; respondedAt: string | null };
type Case = { reportId: string; taskId: string; taskTitle: string; category: string; description: string; status: string; createdAt: string; reporterName: string; posterName: string };
type Audit = { auditId: string; adminClerkId: string; action: string; targetType: string; targetId: string; beforeState: string | null; afterState: string | null; reason: string; createdAt: string };
type Note = { noteId: string; adminClerkId: string; note: string; createdAt: string };
type Detail = { item: Watch | Dispute | Case; notes: Note[]; signals?: { sourceId: string; taskTitle: string; sourceType: string; rating: number | null; detail: string | null; createdAt: string }[] };
type Row = ActiveTask | Watch | Dispute | Case | Audit;

const sections: Record<Section, { eyebrow: string; title: string; description: string; path: string }> = {
  dashboard: { eyebrow: "OPERATIONS AT A GLANCE", title: "Safety overview", description: "A live view of task activity and cases requiring attention.", path: "/overview" },
  tasks: { eyebrow: "ACTIVE TASK MONITORING", title: "Ongoing tasks", description: "Agreed task locations and operational status. Student live location is never displayed here.", path: "/tasks" },
  watchlist: { eyebrow: "REVIEW SIGNALS", title: "Safety watchlist", description: "Low ratings and repeated serious reports prompt a review, not a finding of misconduct.", path: "/watchlist" },
  disputes: { eyebrow: "DIRECT PAYMENT CASES", title: "Payment disputes", description: "Record statements and reasoned outcomes. UniWork does not verify or process direct payments.", path: "/disputes" },
  cases: { eyebrow: "SAFETY INVESTIGATIONS", title: "Safety reports", description: "Review student reports and document case decisions.", path: "/cases" },
  "audit-logs": { eyebrow: "ACCOUNTABILITY", title: "Audit history", description: "Append-only records of administrator decisions and actions.", path: "/audit-logs" },
};
const labels = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, (first) => first.toUpperCase());
const date = (value?: string | null) => value ? new Date(value).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
const lkr = (value: number) => `LKR ${Number(value).toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;

function Status({ value }: { value: string }) { return <span className={`admin-status ${/RESOLVED|COMPLETED/.test(value) ? "resolved" : /OPEN|FLAGGED|AWAITING|ACTIVE/.test(value) ? "pending" : /INSUFFICIENT|DISMISSED|STOPPED/.test(value) ? "muted" : "review"}`}>{labels(value)}</span>; }
function Heading({ section }: { section: Section }) { const info = sections[section]; return <header className="admin-heading"><p>{info.eyebrow}</p><h1>{info.title}</h1><span>{info.description}</span></header>; }
function Empty({ children }: { children: ReactNode }) { return <div className="admin-empty"><ShieldAlert size={23} /><strong>Nothing to show yet</strong><p>{children}</p></div>; }

export function AdminPage({ section }: { section: Section }) {
  const api = useAuthenticatedApi();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [result, setResult] = useState<PageResponse<Row> | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [startedAfter, setStartedAfter] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [expiry, setExpiry] = useState("");
  const closeDetail = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!selected) return;
    closeDetail.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelected(null); setDetail(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, detail]);

  useEffect(() => {
    let active = true;
    const failure = (cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "The safety workspace could not be loaded."); };
    if (section === "dashboard") void api<Overview>("/api/v1/admin/overview").then((data) => { if (active) { setOverview(data); setError(""); } }).catch(failure);
    else {
      const params = new URLSearchParams({ page: String(page), size: "20" });
      if (status) params.set("status", status);
      if (section === "tasks") { if (appliedSearch) params.set("search", appliedSearch); if (startedAfter) params.set("startedAfter", new Date(`${startedAfter}T00:00:00+05:30`).toISOString()); }
      void api<PageResponse<Row>>(`/api/v1/admin${sections[section].path}?${params}`).then((data) => { if (active) { setResult(data); setError(""); } }).catch(failure);
    }
    return () => { active = false; };
  }, [api, section, page, status, appliedSearch, startedAfter, refresh]);
  useEffect(() => {
    if (!selected || !["watchlist", "disputes", "cases"].includes(section)) return;
    let active = true;
    void api<Detail>(`/api/v1/admin${sections[section].path}/${selected}`).then((value) => { if (active) setDetail(value); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load case details."); });
    return () => { active = false; };
  }, [api, section, selected, refresh]);

  async function action(path: string, body: unknown, method = "POST") {
    if (!window.confirm("Record this administrator action? It will be saved in the audit history.")) return;
    setBusy(true); setError("");
    try {
      await api(`/api/v1/admin${path}`, { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
      setNote(""); setReason(""); setRefresh((value) => value + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The action could not be saved."); }
    finally { setBusy(false); }
  }
  const records = result?.content ?? [];
  const activeTasks = section === "tasks" ? records as ActiveTask[] : [];
  const caseType = section === "watchlist" ? "WATCHLIST" : section === "disputes" ? "DISPUTE" : "SAFETY_REPORT";
  const statuses = section === "tasks" ? ["STARTED", "ONGOING"] : section === "watchlist" ? ["FLAGGED_FOR_REVIEW", "UNDER_INVESTIGATION", "RESOLVED", "DISMISSED"] : section === "disputes" ? ["OPEN", "AWAITING_POSTER_RESPONSE", "UNDER_REVIEW", "RESOLVED", "INSUFFICIENT_EVIDENCE"] : ["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"];

  return <div className="admin-page"><Heading section={section} />{error && <div className="admin-error" role="alert">{error} <button onClick={() => setRefresh((value) => value + 1)}>Retry</button></div>}
    {section === "dashboard" && (overview ? <><div className="admin-metrics">{[
      { label: "Ongoing tasks", value: overview.ongoingTasks, href: "/admin/tasks", icon: BriefcaseBusiness },
      { label: "Active SafeTask sessions", value: overview.activeSafeTaskSessions, href: "/admin/tasks", icon: MapPin },
      { label: "Flagged posters", value: overview.flaggedPosters, href: "/admin/watchlist", icon: Users },
      { label: "Open payment disputes", value: overview.openPaymentDisputes, href: "/admin/disputes", icon: FileWarning },
      { label: "Unresolved safety reports", value: overview.unresolvedSafetyReports, href: "/admin/cases", icon: ShieldAlert },
      { label: "Cases requiring review", value: overview.casesRequiringReview, href: "/admin/cases", icon: Activity },
    ].map(({ label, value, href, icon: Icon }) => <Link className="admin-metric" href={href} key={label}><span><Icon size={19} />{label}</span><strong>{value}</strong><small>Open workspace <ArrowRight size={14} /></small></Link>)}</div><div className="admin-charts"><article><h2>Task activity</h2><p>Ongoing task status</p><Bar label="Started" count={overview.startedTasks} total={overview.ongoingTasks} /><Bar label="Ongoing" count={overview.otherOngoingTasks} total={overview.ongoingTasks} /></article><article><h2>Payment cases</h2><p>Current case distribution</p><Bar label="Open or in review" count={overview.openPaymentDisputes} total={overview.openPaymentDisputes + overview.resolvedDisputes} /><Bar label="Resolved" count={overview.resolvedDisputes} total={overview.openPaymentDisputes + overview.resolvedDisputes} /></article></div></> : !error && <div className="admin-loading">Loading platform metrics…</div>)}
    {section !== "dashboard" && <><form className="admin-filters" onSubmit={(event) => { event.preventDefault(); setPage(0); setAppliedSearch(search.trim()); }}>
      {section === "tasks" && <label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Task, poster or student" aria-label="Search tasks" /></label>}
      {section !== "audit-logs" && <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{labels(value)}</option>)}</select>}
      {section === "tasks" && <input aria-label="Started after" type="date" value={startedAfter} onChange={(event) => { setStartedAfter(event.target.value); setPage(0); }} />}
      {section === "tasks" && <button type="submit">Search</button>}
    </form>
    {section === "tasks" && <div className="admin-map-panel"><div><h2>Agreed task locations</h2><p>Only the location set for each task is shown. No student live GPS is accessed.</p></div><AdminTaskMap tasks={activeTasks} /></div>}
    <section className="admin-records"><div className="admin-records-head"><h2>{section === "tasks" ? "Task list" : sections[section].title}</h2><span>{result ? `${result.totalElements} records` : "Loading…"}</span></div>
      {!result && !error ? <div className="admin-loading">Loading records…</div> : records.length === 0 ? <Empty>{section === "tasks" ? "No ongoing tasks match these filters." : "New records will appear as activity is reported."}</Empty> : <div className="admin-record-list">{records.map((item) => {
        if (section === "tasks") { const row = item as ActiveTask; return <article className="admin-record" id={`task-${row.taskId}`} key={row.taskId}><div><strong>{row.title}</strong><small>{row.taskId}</small><p><MapPin size={14} />{row.locationAddress}</p><p>Poster: {row.posterName} · Student: {row.studentName}</p><p>Started {date(row.startedAt)} · SafeTask: {labels(row.safeTaskStatus)}</p></div><Status value={row.status} /></article>; }
        if (section === "watchlist") { const row = item as Watch; return <button type="button" className="admin-record admin-selectable" key={row.posterUserId} onClick={() => { setSelected(row.posterUserId); setDetail(null); }}><div><strong>{row.posterName}</strong><small>{row.posterUserId}</small><p>{row.oneStarReviews} one-star · {row.twoStarReviews} two-star · {row.seriousReports} serious reports</p><p>Average {row.averageRating.toFixed(1)} / 5 from {row.totalReviews} reviews · flagged {date(row.flaggedAt)}</p></div><Status value={row.status} /></button>; }
        if (section === "disputes") { const row = item as Dispute; return <button type="button" className="admin-record admin-selectable" key={row.disputeId} onClick={() => { setSelected(row.disputeId); setDetail(null); }}><div><strong>{row.taskTitle}</strong><small>Case {row.disputeId}</small><p>{row.studentName} → {row.posterName} · {lkr(row.agreedAmountLkr)}</p><p>{labels(row.reason)} · filed {date(row.createdAt)}</p></div><Status value={row.status} /></button>; }
        if (section === "cases") { const row = item as Case; return <button type="button" className="admin-record admin-selectable" key={row.reportId} onClick={() => { setSelected(row.reportId); setDetail(null); }}><div><strong>{row.taskTitle}</strong><small>Report {row.reportId}</small><p>{labels(row.category)} · {row.reporterName} → {row.posterName}</p><p>Filed {date(row.createdAt)}</p></div><Status value={row.status} /></button>; }
        const row = item as Audit; return <article className="admin-record" key={row.auditId}><div><strong>{labels(row.action)}</strong><small>{date(row.createdAt)} · {row.adminClerkId}</small><p>{row.targetType} {row.targetId} · {row.beforeState || "—"} → {row.afterState || "—"}</p><p>{row.reason}</p></div></article>;
      })}</div>}
      {result && result.totalPages > 1 && <div className="admin-pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {result.totalPages}</span><button disabled={page + 1 >= result.totalPages} onClick={() => setPage(page + 1)}>Next</button></div>}
    </section></>}
    {selected && detail && <div className="admin-detail-backdrop" onClick={() => { setSelected(null); setDetail(null); }}><section className="admin-detail" role="dialog" aria-modal="true" aria-label="Case details" onClick={(event) => event.stopPropagation()}><button ref={closeDetail} className="admin-detail-close" onClick={() => { setSelected(null); setDetail(null); }} aria-label="Close case details">×</button><p className="admin-detail-eyebrow">{sections[section].eyebrow}</p><h2>{"posterName" in detail.item ? detail.item.posterName : "Case details"}</h2><Status value={detail.item.status} />
      {section === "watchlist" && <WatchDetail item={detail.item as Watch} />}{section === "disputes" && <DisputeDetail item={detail.item as Dispute} />}{section === "cases" && <CaseDetail item={detail.item as Case} />}
      {detail.signals && <div className="admin-detail-block"><h3>Reviews and serious reports</h3>{detail.signals.map((signal) => <p key={signal.sourceId}><strong>{signal.sourceType === "REVIEW" ? `${signal.rating}★ review` : "Safety report"}</strong> · {signal.taskTitle} · {date(signal.createdAt)}<br />{signal.detail || "No written detail provided."}</p>)}</div>}
      <div className="admin-detail-block"><h3>Investigation notes</h3>{detail.notes.length ? detail.notes.map((entry) => <p key={entry.noteId}><strong>{date(entry.createdAt)}</strong> · {entry.adminClerkId}<br />{entry.note}</p>) : <p>No notes recorded.</p>}<textarea value={note} maxLength={2000} onChange={(event) => setNote(event.target.value)} placeholder="Add a factual investigation note" aria-label="Investigation note" /><button disabled={busy || !note.trim()} onClick={() => void action(`/notes/${caseType}/${selected}`, { note: note.trim() })}>Save note</button></div>
      <div className="admin-detail-block"><h3>Case decision</h3><select aria-label="New case status" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}><option value="">Select status</option>{statuses.map((value) => <option key={value} value={value}>{labels(value)}</option>)}</select><textarea value={reason} maxLength={2000} onChange={(event) => setReason(event.target.value)} placeholder="Reason for this decision" aria-label="Decision reason" /><button disabled={busy || !nextStatus || !reason.trim()} onClick={() => void action(`/decisions/${caseType}/${selected}`, { status: nextStatus, reason: reason.trim() })}>Record decision</button></div>
      {section === "watchlist" && <div className="admin-detail-block"><h3>Poster controls</h3><p>Restrictions affect future publishing only. Existing tasks stay intact.</p><input type="datetime-local" aria-label="Restriction expiry" value={expiry} onChange={(event) => setExpiry(event.target.value)} /><button disabled={busy || !expiry || !reason.trim()} onClick={() => void action(`/posters/${selected}/restriction`, { expiresAt: new Date(expiry).toISOString(), reason: reason.trim() })}>Apply temporary restriction</button><button disabled={busy || !reason.trim()} onClick={() => void action(`/posters/${selected}/warnings`, { reason: reason.trim() })}>Record warning</button><button disabled={busy || !reason.trim()} onClick={() => void action(`/posters/${selected}/restriction`, { reason: reason.trim() }, "DELETE")}>Remove restriction</button></div>}
    </section></div>}
  </div>;
}

function Bar({ label, count, total }: { label: string; count: number; total: number }) { return <div className="admin-bar"><div><span>{label}</span><strong>{count}</strong></div><div className="admin-bar-track"><span style={{ width: `${total ? Math.max(2, count / total * 100) : 0}%` }} /></div></div>; }
function WatchDetail({ item }: { item: Watch }) { return <div className="admin-detail-block"><p>Account {item.posterUserId}</p><p>{item.totalReviews} reviews · Average {item.averageRating.toFixed(1)} / 5</p><p>{item.oneStarReviews} one-star · {item.twoStarReviews} two-star · {item.seriousReports} serious reports</p><p>{item.completedTasks} completed tasks · {item.paymentDisputes} payment disputes</p><p>Flagged {date(item.flaggedAt)} · Latest signal {date(item.lastSignalAt)}</p>{item.decisionReason && <p>Previous decision: {item.decisionReason}</p>}<Link href="/admin/cases">Review safety reports</Link></div>; }
function DisputeDetail({ item }: { item: Dispute }) { return <div className="admin-detail-block"><p>Case {item.disputeId} · Task {item.taskId}</p><p>{item.studentName} → {item.posterName}</p><p>Agreed {lkr(item.agreedAmountLkr)} · Reported received {item.actualAmountLkr == null ? "Not provided" : lkr(item.actualAmountLkr)}</p><p><strong>Student statement:</strong> {item.studentStatement}</p><p><strong>Poster response:</strong> {item.posterResponse || "Awaiting response"}</p><p>Poster states payment was made: {item.posterSaysPaid == null ? "No response" : item.posterSaysPaid ? "Yes" : "No"}</p>{item.outcome && <p><strong>Outcome:</strong> {item.outcome}</p>}</div>; }
function CaseDetail({ item }: { item: Case }) { return <div className="admin-detail-block"><p>Report {item.reportId} · Task {item.taskId}</p><p>{item.reporterName} → {item.posterName}</p><p>{labels(item.category)} · {date(item.createdAt)}</p><p>{item.description}</p></div>; }
