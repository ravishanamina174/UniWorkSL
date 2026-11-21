"use client";

import { useEffect, useState } from "react";
import type { PaymentDispute } from "@uniwork/api-contracts";
import { Button } from "@/components/ui/button";
import { useAuthenticatedApi } from "./use-api";

export function PaymentDisputePanel({ taskId }: { taskId: string }) {
  const api = useAuthenticatedApi();
  const [cases, setCases] = useState<PaymentDispute[]>([]);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [paid, setPaid] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    void api<PaymentDispute[]>(`/api/v1/poster/tasks/${taskId}/payment-disputes`).then((value) => { if (active) { setCases(value); setError(""); } }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Payment cases could not be loaded."); });
    return () => { active = false; };
  }, [api, taskId, refresh]);
  async function respond(id: string) {
    if (!details[id]?.trim() || !paid[id]) return;
    if (!window.confirm("Submit this response? It cannot be edited after submission.")) return;
    setBusy(true);
    try { await api(`/api/v1/poster/payment-disputes/${id}/response`, { method: "POST", body: JSON.stringify({ paymentMade: paid[id] === "yes", details: details[id].trim() }) }); setRefresh((value) => value + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The response could not be saved."); }
    finally { setBusy(false); }
  }
  if (!cases.length && !error) return null;
  return <section className="form-section"><div className="form-section-heading"><h2>Payment complaints</h2><p>Direct payment reports related to this task. UniWork does not process or verify payments.</p></div>
    {error && <p className="form-alert" role="alert">{error}</p>}
    {cases.map((item) => <article className="payment-dispute-case" key={item.disputeId}><strong>{item.reason === "PAYMENT_NOT_RECEIVED" ? "Payment not received" : "Incorrect payment amount"}</strong><span>{item.status.replaceAll("_", " ")} · Agreed {Number(item.agreedAmountLkr).toLocaleString("en-LK")} LKR</span><p>{item.studentStatement}</p>
      {item.posterResponse ? <p><strong>Your response:</strong> {item.posterResponse}</p> : <div className="payment-dispute-form"><label>Was payment made?<select value={paid[item.disputeId] || ""} onChange={(event) => setPaid({ ...paid, [item.disputeId]: event.target.value })}><option value="">Select an answer</option><option value="yes">Yes</option><option value="no">No</option></select></label><label>Response details<textarea maxLength={2000} value={details[item.disputeId] || ""} onChange={(event) => setDetails({ ...details, [item.disputeId]: event.target.value })} placeholder="Describe the payment arrangement and transaction without sharing bank or card details." /></label><Button disabled={busy || !paid[item.disputeId] || !details[item.disputeId]?.trim()} onClick={() => void respond(item.disputeId)}>Submit response</Button></div>}
    </article>)}</section>;
}
