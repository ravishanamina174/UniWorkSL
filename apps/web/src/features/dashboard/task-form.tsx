"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Task, TaskInput } from "@uniwork/api-contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError } from "@/services/api-client";
import { useAuthenticatedApi } from "./use-api";
import { GoogleMapPicker, type Coordinates } from "./google-map-picker";
import { isValidCoordinatePair, parseRequiredSkills } from "./task-form-validation";

export function TaskForm({ initial, taskId }: { initial?: Task; taskId?: string }) {
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [savedTaskId, setSavedTaskId] = useState(taskId ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [enhancing, setEnhancing] = useState<"TITLE" | "DESCRIPTION" | "">("");
  const [preview, setPreview] = useState<{ type: "TITLE" | "DESCRIPTION"; originalText: string; enhancedText: string } | null>(null);
  const location: Coordinates | null = latitude !== "" && longitude !== "" && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    ? { latitude: Number(latitude), longitude: Number(longitude) } : null;

  function setCoordinates(coordinates: Coordinates) {
    setLatitude(coordinates.latitude.toFixed(6));
    setLongitude(coordinates.longitude.toFixed(6));
  }

  async function enhance(type: "TITLE" | "DESCRIPTION", text: string) {
    if (!text.trim()) { setError(`Enter a ${type.toLowerCase()} draft first.`); return; }
    setEnhancing(type); setError("");
    try { setPreview(await api<{ type: typeof type; originalText: string; enhancedText: string }>("/api/v1/ai/enhance-text", { method: "POST", body: JSON.stringify({ type, text }) })); }
    catch (cause) { setError(cause instanceof ApiRequestError ? cause.message : "AI enhancement is temporarily unavailable."); }
    finally { setEnhancing(""); }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>, publish: boolean) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setVerificationRequired(false);
    const form = new FormData(event.currentTarget);
    const skillInput = parseRequiredSkills(String(form.get("requiredSkills") ?? ""));
    if (skillInput.error) { setError(skillInput.error); setSaving(false); return; }
    const payload: TaskInput = {
      title: String(form.get("title") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      amountLkr: Number(form.get("amountLkr")),
      taskDateTime: String(form.get("taskDateTime") ?? ""),
      locationAddress: String(form.get("locationAddress") ?? "").trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      requiredSkills: skillInput.skills ?? [],
    };
    if (!latitude || !longitude || !isValidCoordinatePair(payload.latitude, payload.longitude)) {
      setError("Choose a location or enter valid latitude and longitude coordinates."); setSaving(false); return;
    }
    try {
      let result: Task;
      if (savedTaskId) {
        result = await api<Task>(`/api/v1/poster/tasks/${savedTaskId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        result = await api<Task>("/api/v1/poster/tasks", { method: "POST", body: JSON.stringify(payload) });
        setSavedTaskId(result.taskId);
      }
      if (publish) result = await api<Task>(`/api/v1/poster/tasks/${result.taskId}/publish`, { method: "POST" });
      router.push(`/dashboard/tasks/${result.taskId}`);
      router.refresh();
    } catch (cause) {
      setVerificationRequired(cause instanceof ApiRequestError && cause.code === "NIC_VERIFICATION_REQUIRED");
      setError(cause instanceof ApiRequestError ? cause.message : cause instanceof Error ? cause.message : "The task could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <form className="dashboard-form" onSubmit={(event) => { const submitter = (event.nativeEvent as SubmitEvent).submitter; const publish = submitter instanceof HTMLButtonElement && submitter.dataset.publish === "true"; void handleSubmit(event, publish); }}>
    <section className="form-section"><div className="form-section-heading"><h2>Task information</h2><p>Use clear details so students can understand the work.</p></div>
      <div className="form-grid">
        <label className="form-field form-field-full"><span className="field-label-row"><span>Title</span><button type="button" className="text-button" onClick={() => void enhance("TITLE", title)} disabled={enhancing !== ""}>{enhancing === "TITLE" ? "Enhancing…" : "Enhance with AI"}</button></span><Input name="title" maxLength={120} required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Help move a bookshelf" /></label>
        <label className="form-field form-field-full"><span className="field-label-row"><span>Description</span><button type="button" className="text-button" onClick={() => void enhance("DESCRIPTION", description)} disabled={enhancing !== ""}>{enhancing === "DESCRIPTION" ? "Enhancing…" : "Enhance with AI"}</button></span><Textarea name="description" maxLength={5000} rows={5} required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the work, timing, and anything the student should bring." /></label>
        <label className="form-field"><span>Amount (LKR)</span><Input name="amountLkr" type="number" min="0.01" max="9999999999.99" step="0.01" inputMode="decimal" required defaultValue={initial?.amountLkr ?? ""} /></label>
        <label className="form-field"><span>Task date and time (Sri Lanka)</span><Input name="taskDateTime" type="datetime-local" required defaultValue={initial?.taskDateTime?.slice(0, 16) ?? ""} /></label>
        <label className="form-field form-field-full"><span>Required skills</span><Input name="requiredSkills" maxLength={1800} required defaultValue={initial?.requiredSkills.join(", ") ?? ""} placeholder="Gardening, lifting, careful handling" /><small>Separate skills with commas, up to 20 skills.</small></label>
      </div>
    </section>
    {preview ? <section className="ai-preview" aria-live="polite"><div><strong>AI suggestion</strong><button type="button" className="text-button" onClick={() => setPreview(null)}>Close</button></div><dl><div><dt>Original</dt><dd>{preview.originalText}</dd></div><div><dt>Enhanced</dt><dd>{preview.enhancedText}</dd></div></dl><div className="form-actions"><Button type="button" variant="secondary" onClick={() => setPreview(null)}>Keep original</Button><Button type="button" onClick={() => { if (preview.type === "TITLE") setTitle(preview.enhancedText); else setDescription(preview.enhancedText); setPreview(null); }}>Use enhanced text</Button></div></section> : null}
    <section className="form-section"><div className="form-section-heading"><h2>Task location</h2><p>Select the work location and enter its address.</p></div>
      <div className="form-grid">
        <label className="form-field form-field-full"><span>Location / address</span><Input name="locationAddress" autoComplete="street-address" maxLength={500} required defaultValue={initial?.locationAddress ?? ""} placeholder="Street, area, town or city" /></label>
        <div className="form-field form-field-full"><GoogleMapPicker value={location} onChange={setCoordinates} /></div>
        <label className="form-field"><span>Latitude</span><Input type="number" min="-90" max="90" step="0.000001" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} required /></label>
        <label className="form-field"><span>Longitude</span><Input type="number" min="-180" max="180" step="0.000001" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} required /></label>
      </div>
    </section>
    {error ? <div className="form-alert" role="alert">{verificationRequired ? <strong>NIC Verification Required. </strong> : null}{error} {verificationRequired ? <Link href="/dashboard/profile">Verify your NIC in Profile</Link> : null}{savedTaskId ? <> Draft saved. <Link href={`/dashboard/tasks/${savedTaskId}`}>Open task</Link></> : null}</div> : null}
    <div className="form-actions"><Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button><Button type="submit" variant="secondary" disabled={saving}>{saving ? "Saving…" : "Save draft"}</Button><Button type="submit" data-publish="true" disabled={saving}>{saving ? "Saving…" : "Publish task"}</Button></div>
  </form>;
}
