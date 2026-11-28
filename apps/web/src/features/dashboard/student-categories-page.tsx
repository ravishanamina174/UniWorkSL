"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { BadgeCheck, ArrowRight, MapPin, Star, X } from "lucide-react";
import { STUDENT_CATEGORIES, type StudentCategory } from "@uniwork/api-contracts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GoogleMapPicker, type Coordinates } from "./google-map-picker";
import { useAuthenticatedApi } from "./use-api";
import { CategoryIcon } from "@/components/categories/category-icon";
import { ApiRequestError } from "@/services/api-client";
import { prepareQuote, type QuoteFieldErrors, type QuoteFields } from "./quote-payload";

type Student = { userId: string; name: string; primaryArea: string | null; summary: string | null; primaryCategory: StudentCategory; rating: number; reviewCount: number; nicReviewed: boolean };
type Quote = { directTaskId: string; studentName: string; description: string; amountLkr: number; locationAddress: string; status: string; counterAmountLkr?: number | null; taskId?: string | null };
const emptyQuote = { description: "", scheduledAt: "", amountLkr: "", locationAddress: "" };

export function StudentCategoriesPage() {
  const api = useAuthenticatedApi();
  const [category, setCategory] = useState<StudentCategory | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quote, setQuote] = useState(emptyQuote);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<QuoteFieldErrors>({});
  const resultsRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  useEffect(() => { void api<Quote[]>("/api/v1/poster/direct-tasks").then(setQuotes).catch(() => setError("Sent quotes could not be loaded.")); }, [api]);
  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelected(null); setQuoteOpen(false); } };
    document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey);
  }, [selected]);
  useEffect(() => {
    if (!category) return;
    const frame = requestAnimationFrame(scrollToResults);
    return () => cancelAnimationFrame(frame);
  }, [category]);
  function scrollToResults() {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }
  async function choose(value: StudentCategory) {
    if (category === value) requestAnimationFrame(scrollToResults);
    setCategory(value); setStudents([]); setSelected(null); setLoading(true); setError("");
    try { setStudents(await api<Student[]>(`/api/v1/public/categories/${value}/students`)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Students could not be loaded."); }
    finally { setLoading(false); }
  }
  function updateQuote(field: keyof QuoteFields, value: string) {
    setQuote((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const prepared = prepareQuote(selected.userId, selected.primaryCategory, quote, location);
    setFieldErrors(prepared.errors);
    if (!prepared.payload) { setError("Review the highlighted fields and try again."); return; }
    setSending(true); setError("");
    try {
      await api("/api/v1/poster/direct-tasks", { method: "POST", body: JSON.stringify(prepared.payload) });
      setQuotes(await api<Quote[]>("/api/v1/poster/direct-tasks"));
      setQuoteOpen(false); setSelected(null); setQuote(emptyQuote); setLocation(null); setFieldErrors({});
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.code === "VALIDATION_FAILED") {
        const errors = { ...cause.fieldErrors } as Record<string, string>;
        if (errors.latitude || errors.longitude) errors.location = errors.latitude || errors.longitude;
        setFieldErrors(errors);
        setError("Review the highlighted fields and try again.");
      } else setError(cause instanceof Error ? cause.message : "Quote could not be sent.");
    } finally { setSending(false); }
  }
  async function decide(item: Quote, action: "ACCEPT" | "REJECT") {
    try { const updated = await api<Quote>(`/api/v1/poster/direct-tasks/${item.directTaskId}/action`, { method: "POST", body: JSON.stringify({ action }) }); setQuotes((current) => current.map((quote) => quote.directTaskId === item.directTaskId ? updated : quote)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Counteroffer could not be updated."); }
  }
  const active = STUDENT_CATEGORIES.find((item) => item.value === category);
  return <div className="dashboard-content-stack student-categories-page">
    <header className="dashboard-page-head"><div><p className="eyebrow">FIND THE RIGHT STUDENT</p><h1>Student Categories</h1><p>Explore discoverable student profiles and send a private task offer.</p></div></header>
    <section className="category-workspace-section"><div className="dashboard-section-head"><h2>Explore categories</h2><p>Select the kind of help you need.</p></div><div className="category-workspace-grid">{STUDENT_CATEGORIES.map((item, index) => <button type="button" className={`category-workspace-card${category === item.value ? " selected" : ""}`} aria-pressed={category === item.value} key={item.value} onClick={() => void choose(item.value)}><span className="category-card-icon"><CategoryIcon category={item.value} size={19} /></span><span className="category-card-title">{item.label}</span><span className="category-card-index">{String(index + 1).padStart(2, "0")} <ArrowRight size={16} aria-hidden="true" /></span></button>)}</div></section>
    {error && !(selected && quoteOpen) && <div className="form-alert" role="alert">{error}</div>}
    {category && <section ref={resultsRef} className="category-workspace-section category-results"><div className="dashboard-section-head"><h2>{active?.label} students</h2><p>Only students who chose to make their profiles discoverable appear here.</p></div>{loading ? <p role="status">Loading students…</p> : students.length ? <div className="category-student-grid">{students.map((student) => <button type="button" className="category-student-card" key={student.userId} onClick={() => { setError(""); setSelected(student); }}><span className="category-student-avatar" aria-hidden="true">{student.name.slice(0, 1)}</span><strong>{student.name}</strong><span><MapPin size={14} /> {student.primaryArea || "Sri Lanka"}</span><span>{active?.label}</span><p>{student.summary || "No public summary yet."}</p><span className="category-student-footer"><span>{student.reviewCount ? `★ ${student.rating.toFixed(1)}/5 (${student.reviewCount})` : "New"}</span>{student.nicReviewed && <span className="public-verified"><BadgeCheck size={14} /> NIC Reviewed</span>}</span><span className="category-student-view">View profile <ArrowRight size={15} /></span></button>)}</div> : <div className="category-empty">No discoverable students in this category yet.</div>}</section>}
    <section className="category-workspace-section"><div className="dashboard-section-head"><h2>Sent Quotes</h2><p>Track offers and respond to counteroffers.</p></div>{quotes.length ? <div className="sent-quotes-grid">{quotes.map((item) => <article className="sent-quote-card" key={item.directTaskId}><div className="sent-quote-top"><strong>{item.studentName}</strong><span className="sent-quote-status" data-status={item.status}>{item.status.replaceAll("_", " ")}</span></div><p>{item.description}</p><div className="sent-quote-meta"><span>LKR {Number(item.amountLkr).toLocaleString("en-LK")}</span><span>{item.locationAddress}</span></div>{item.counterAmountLkr && <p className="sent-quote-counter">Proposed budget: LKR {Number(item.counterAmountLkr).toLocaleString("en-LK")}</p>}{item.status === "COUNTEROFFERED" && <div className="form-actions"><Button type="button" onClick={() => void decide(item, "ACCEPT")}>Accept counteroffer</Button><Button type="button" variant="secondary" onClick={() => void decide(item, "REJECT")}>Reject</Button></div>}</article>)}</div> : <div className="category-empty">No quotes sent yet. Select a student above to get started.</div>}</section>
    {selected && <div className="category-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelected(null); setQuoteOpen(false); } }}><section className="category-dialog" role="dialog" aria-modal="true" aria-label={quoteOpen ? `Send a Quote to ${selected.name}` : `${selected.name} profile`}><button className="category-dialog-close" type="button" aria-label="Close" onClick={() => { setSelected(null); setQuoteOpen(false); }}><X size={19} /></button>{quoteOpen ? <form noValidate onSubmit={(event) => void send(event)}><p className="eyebrow">PRIVATE OFFER</p><h2>Send a Quote to {selected.name}</h2>{error && <div className="form-alert" role="alert">{error}</div>}<div className="form-grid"><label className="form-field form-field-full"><span>Work description</span><Textarea required maxLength={2000} rows={3} aria-invalid={Boolean(fieldErrors.description)} value={quote.description} onChange={(event) => updateQuote("description", event.target.value)} />{fieldErrors.description && <small className="field-error">{fieldErrors.description}</small>}</label><label className="form-field"><span>Date and time</span><input required type="datetime-local" aria-invalid={Boolean(fieldErrors.scheduledAt)} value={quote.scheduledAt} onChange={(event) => updateQuote("scheduledAt", event.target.value)} />{fieldErrors.scheduledAt && <small className="field-error">{fieldErrors.scheduledAt}</small>}</label><label className="form-field"><span>Budget (LKR)</span><input required min="0.01" step="0.01" type="number" aria-invalid={Boolean(fieldErrors.amountLkr)} value={quote.amountLkr} onChange={(event) => updateQuote("amountLkr", event.target.value)} />{fieldErrors.amountLkr && <small className="field-error">{fieldErrors.amountLkr}</small>}</label><label className="form-field form-field-full"><span>Readable task address</span><input required maxLength={500} aria-invalid={Boolean(fieldErrors.locationAddress)} value={quote.locationAddress} onChange={(event) => updateQuote("locationAddress", event.target.value)} />{fieldErrors.locationAddress && <small className="field-error">{fieldErrors.locationAddress}</small>}</label><div className="form-field form-field-full"><GoogleMapPicker manualCoordinatesAvailable={false} value={location} onChange={(coordinates) => { setLocation(coordinates); setFieldErrors((current) => ({ ...current, location: undefined })); }} onAddressChange={(address) => setQuote((current) => ({ ...current, locationAddress: address }))} />{fieldErrors.location && <small className="field-error">{fieldErrors.location}</small>}</div></div><div className="form-actions"><Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send Quote"}</Button><Button type="button" variant="secondary" onClick={() => setQuoteOpen(false)}>Back to profile</Button></div></form> : <div><p className="eyebrow">STUDENT PROFILE</p><h2>{selected.name}</h2><p className="category-dialog-location"><MapPin size={16} /> {selected.primaryArea || "Sri Lanka"}</p><p className="category-dialog-summary">{selected.summary || "No public summary yet."}</p><div className="category-dialog-facts"><span>{active?.label}</span><span><Star size={15} /> {selected.reviewCount ? `${selected.rating.toFixed(1)}/5 (${selected.reviewCount} reviews)` : "New"}</span>{selected.nicReviewed && <span className="public-verified"><BadgeCheck size={15} /> NIC Reviewed</span>}</div><Button type="button" onClick={() => { setError(""); setQuoteOpen(true); }}>Send a Quote <ArrowRight size={16} /></Button></div>}</section></div>}
  </div>;
}
