"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { getApiBaseUrl } from "@/lib/env";
import { BrandSymbol } from "@/components/brand/brand-symbol";

type GuardianView = { status: string; taskTitle: string; generalTaskLocation: string; taskStatus: string; startedAt: string | null; expiresAt: string | null; latitude: number | null; longitude: number | null; accuracyMeters: number | null; lastUpdatedAt: string | null };

export function GuardianPage({ token }: { token: string }) {
  const [view, setView] = useState<GuardianView | null>(null);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/v1/public/safetask/${encodeURIComponent(token)}`, { cache: "no-store", referrerPolicy: "no-referrer" });
        if (!alive) return;
        if (response.status === 404) { setEnded(true); setView(null); return; }
        if (!response.ok) throw new Error("Location is temporarily unavailable. Please try again.");
        setView(await response.json() as GuardianView); setCheckedAt(Date.now()); setError("");
      } catch (cause) { if (alive) setError(cause instanceof Error ? cause.message : "Could not refresh location."); }
    }
    void refresh(); const timer = window.setInterval(() => void refresh(), 60_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [token]);
  useEffect(() => {
    if (!container.current || view?.latitude == null || view.longitude == null) return;
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !container.current) return;
      map.current?.remove();
      map.current = leaflet.map(container.current).setView([view.latitude!, view.longitude!], 15);
      leaflet.tileLayer(process.env.NEXT_PUBLIC_SAFETASK_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>', maxZoom: 19,
      }).addTo(map.current);
      leaflet.circleMarker([view.latitude!, view.longitude!], { radius: 11, color: "#425B9A", fillColor: "#425B9A", fillOpacity: .85 }).addTo(map.current);
    });
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, [view?.latitude, view?.longitude]);
  const coordinates = view?.latitude != null && view.longitude != null;
  const delayed = view?.lastUpdatedAt && checkedAt !== null && checkedAt - Date.parse(view.lastUpdatedAt) > 10 * 60_000;
  return <main className="guardian-page"><div className="guardian-wrap"><header className="guardian-header"><div className="guardian-brand"><BrandSymbol className="brand-mark" /> UniWorkSL <span>SafeTask</span></div><h1>Guardian Location Sharing</h1><p>Private location sharing chosen by the student. Updates may be delayed by signal, battery settings, or connectivity.</p></header>
    {ended ? <section className="guardian-card"><h2>Location Sharing Has Ended</h2><p>This safety-sharing session is no longer available.</p></section> : <>
      {error && <p role="alert" className="guardian-error">{error}</p>}
      {view ? <><section className="guardian-card"><strong className="guardian-status">{view.status === "SAFETY_WINDOW" ? "Task Completed — Safety Window" : view.status === "PENDING" ? "Waiting for task start" : "Active"}</strong><h2>{view.taskTitle}</h2><p>{view.generalTaskLocation} · {view.taskStatus}</p>{view.startedAt && <p>Task started: {new Date(view.startedAt).toLocaleString()}</p>}</section>
      <section className="guardian-card"><h2>Latest shared location</h2>{coordinates ? <><div ref={container} className="guardian-map" aria-label="Map of last shared position" /><p>Coordinates: {view.latitude}, {view.longitude}</p><p>Last updated: {view.lastUpdatedAt ? new Date(view.lastUpdatedAt).toLocaleString() : "Unavailable"}{delayed ? " — delayed" : ""}</p>{view.accuracyMeters != null && <p>Reported accuracy: approximately {Math.round(view.accuracyMeters)} metres</p>}<a className="guardian-action" href={`https://www.google.com/maps/search/?api=1&query=${view.latitude},${view.longitude}`} target="_blank" rel="noreferrer">Open in Google Maps</a></> : <p>No location has been shared yet. Please check back later.</p>}</section></> : !error && <section className="guardian-card"><p>Loading sharing status…</p></section>}
    </>}
    <section className="guardian-card guardian-emergency"><h2>Need emergency help?</h2><p>For an emergency requiring immediate police assistance in Sri Lanka, call 119. UniWork does not contact emergency services through this page.</p><a className="guardian-action" href="tel:119">Call Police — 119</a></section></div></main>;
}
