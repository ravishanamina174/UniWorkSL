"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { LocateFixed, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Coordinates = { latitude: number; longitude: number };

let loaderConfigured = false;

export function GoogleMapPicker({ value, onChange, onAddressChange, manualCoordinatesAvailable = true }: { value: Coordinates | null; onChange: (coordinates: Coordinates) => void; onAddressChange?: (address: string) => void; manualCoordinatesAvailable?: boolean }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const syncMarker = useRef<(coordinates: Coordinates, pan: boolean) => void>(() => {});
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onAddressChangeRef = useRef(onAddressChange);
  const [mapError, setMapError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY));
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onAddressChangeRef.current = onAddressChange; }, [onAddressChange]);

  useEffect(() => {
    if (!apiKey || !mapElement.current) { setLoading(false); return; }
    let active = true;
    void (async () => {
      try {
        if (!loaderConfigured) {
          setOptions({ key: apiKey, v: "weekly" });
          loaderConfigured = true;
        }
        const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
        if (!active || !mapElement.current) return;
        const initial = valueRef.current;
        const map = new Map(mapElement.current, {
          center: initial ? { lat: initial.latitude, lng: initial.longitude } : { lat: 6.9271, lng: 79.8612 },
          zoom: initial ? 15 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        mapInstance.current = map;
        const resolveAddress = (coordinates: Coordinates) => {
          if (!onAddressChangeRef.current) return;
          new google.maps.Geocoder().geocode({ location: { lat: coordinates.latitude, lng: coordinates.longitude } }, (results, status) => {
            if (status === "OK" && results?.[0]?.formatted_address) onAddressChangeRef.current?.(results[0].formatted_address);
          });
        };
        const setMarker = (coordinates: Coordinates, pan = true) => {
          const position = { lat: coordinates.latitude, lng: coordinates.longitude };
          if (!marker.current) {
            marker.current = new google.maps.Marker({ map, position, draggable: true, title: "Selected task location" });
            marker.current.addListener("dragend", () => {
              const location = marker.current?.getPosition();
              if (location) { const coordinates = { latitude: location.lat(), longitude: location.lng() }; onChangeRef.current(coordinates); resolveAddress(coordinates); }
            });
          } else marker.current.setPosition(position);
          if (pan) map.panTo(position);
        };
        syncMarker.current = setMarker;
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const coordinates = { latitude: event.latLng.lat(), longitude: event.latLng.lng() };
            setMarker(coordinates);
            onChangeRef.current(coordinates); resolveAddress(coordinates);
          }
        });
        if (initial) setMarker(initial, false);
        setMapError("");
      } catch {
        if (active) setMapError("Google Maps could not be loaded. Check the API key, billing, API restrictions, and allowed website referrers.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [apiKey]);

  useEffect(() => {
    if (value && mapInstance.current) syncMarker.current(value, false);
    else if (!value && marker.current) { marker.current.setMap(null); marker.current = null; }
  }, [value]);

  const chooseCurrentLocation = useCallback(() => {
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("This browser does not provide location access."); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      onChangeRef.current(coordinates);
      if (onAddressChangeRef.current && window.google?.maps?.Geocoder) new google.maps.Geocoder().geocode({ location: { lat: coordinates.latitude, lng: coordinates.longitude } }, (results, status) => { if (status === "OK" && results?.[0]?.formatted_address) onAddressChangeRef.current?.(results[0].formatted_address); });
      const map = mapInstance.current;
      if (map) {
        const point = { lat: coordinates.latitude, lng: coordinates.longitude };
        syncMarker.current(coordinates, false);
        map.setCenter(point);
        map.setZoom(15);
      }
    }, () => setLocationError(manualCoordinatesAvailable ? "Location permission was unavailable. You can enter coordinates manually." : "Location permission was unavailable. Allow location access or choose a point on the map."), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }, [manualCoordinatesAvailable]);

  return <div className="map-picker">
    <div className="map-picker-toolbar"><div><MapPin size={16} aria-hidden="true" /><span>Task location</span></div><Button type="button" variant="secondary" onClick={chooseCurrentLocation}><LocateFixed size={15} aria-hidden="true" /> Use my current location</Button></div>
    {apiKey ? <><div className="google-map-frame">{loading ? <div className="map-placeholder" role="status">Loading Google Maps…</div> : null}<div className="google-map" ref={mapElement} aria-label="Google Map. Click to select a task location." />{mapError ? <p className="map-error" role="alert">{mapError}</p> : null}</div><p className="field-hint">Click the map to place a marker, or drag the marker to adjust the location.</p></> : <div className="map-config-message"><MapPin size={18} aria-hidden="true" /><div><strong>Google Maps is not configured.</strong><p>{manualCoordinatesAvailable ? <>Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to <code>apps/web/.env.local</code> for the interactive map. Manual coordinates are available below.</> : <>Use your current location above, or configure <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for map selection.</>}</p></div></div>}
    {locationError ? <p className="field-error" role="alert">{locationError}</p> : null}
  </div>;
}
