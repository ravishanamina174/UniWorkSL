"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

export type MapTask = { taskId: string; title: string; status: string; latitude: number; longitude: number; locationAddress: string };

export function AdminTaskMap({ tasks }: { tasks: MapTask[] }) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    if (!host.current || tasks.length === 0) return;
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !host.current) return;
      map.current?.remove();
      const points = tasks.filter((task) => Number.isFinite(task.latitude) && Number.isFinite(task.longitude));
      if (!points.length) return;
      const instance = leaflet.map(host.current, { scrollWheelZoom: false });
      map.current = instance;
      const url = process.env.NEXT_PUBLIC_ADMIN_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const attribution = process.env.NEXT_PUBLIC_ADMIN_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      leaflet.tileLayer(url, { maxZoom: 18, attribution })
        .on("tileerror", () => setTileError(true)).addTo(instance);
      points.forEach((task) => {
        const title = document.createElement("strong"); title.textContent = task.title;
        const address = document.createElement("p"); address.textContent = `${task.status} · ${task.locationAddress}`;
        const link = document.createElement("a"); link.href = `#task-${task.taskId}`; link.textContent = "View task in list";
        const popup = document.createElement("div"); popup.append(title, address, link);
        leaflet.circleMarker([task.latitude, task.longitude], { radius: 9, color: "#6d5dbc", fillColor: "#a89bf0", fillOpacity: .9 })
          .bindPopup(popup).addTo(instance);
      });
      instance.fitBounds(leaflet.latLngBounds(points.map((task) => [task.latitude, task.longitude])), { padding: [34, 34], maxZoom: 13 });
    });
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, [tasks]);
  if (!tasks.length) return <div className="admin-map-empty">Agreed task locations will appear here when work is ongoing.</div>;
  return <div className="admin-map-wrap"><div ref={host} className="admin-map" aria-label="Map of agreed locations for ongoing tasks" />{tileError && <p role="status">Map tiles are unavailable. Task addresses remain available in the list below.</p>}</div>;
}
