"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

const key = "uniworksl:cookie-consent:v1";
const dismissedKey = "uniworksl:cookie-dismissed:v1";
const settingsEvent = "uniworksl:cookie-settings";
type Choice = "accepted" | "rejected";

function savedChoice(): Choice | null {
  try {
    const record: unknown = JSON.parse(window.localStorage.getItem(key) ?? "null");
    if (record && typeof record === "object" && "version" in record && "choice" in record && record.version === 1
      && (record.choice === "accepted" || record.choice === "rejected")) return record.choice;
  } catch { /* Storage may be unavailable; the notice still works for this visit. */ }
  return null;
}

function dismissedThisVisit(): boolean {
  try { return window.sessionStorage.getItem(dismissedKey) === "yes"; }
  catch { return false; }
}

export function CookieSettingsButton() {
  return <button type="button" className="footer-cookie-settings" onClick={() => window.dispatchEvent(new Event(settingsEvent))}>Cookie settings</button>;
}

export function CookieConsent() {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    let watchingScroll = false;
    const stopWatching = () => {
      if (!watchingScroll) return;
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
      watchingScroll = false;
    };
    const reveal = () => {
      stopWatching();
      setRendered(true); setVisible(true);
    };
    const checkPosition = () => {
      const section = document.getElementById("how-it-works");
      if (section && section.getBoundingClientRect().top <= window.innerHeight * .7) reveal();
    };
    const initialize = window.setTimeout(() => {
      const existing = savedChoice();
      setChoice(existing);
      if (!existing && !dismissedThisVisit()) {
        watchingScroll = true;
        window.addEventListener("scroll", checkPosition, { passive: true });
        window.addEventListener("resize", checkPosition);
        checkPosition();
      }
    }, 0);
    const reopen = () => {
      stopWatching();
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      setRendered(true); setVisible(true);
    };
    window.addEventListener(settingsEvent, reopen);
    return () => {
      window.clearTimeout(initialize);
      stopWatching();
      window.removeEventListener(settingsEvent, reopen);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  function decide(next: Choice) {
    try { window.localStorage.setItem(key, JSON.stringify({ version: 1, choice: next, updatedAt: new Date().toISOString() })); }
    catch { /* Keep the chosen state for this visit when storage is blocked. */ }
    setChoice(next);
    close();
  }

  function close() {
    setVisible(false);
    closeTimer.current = window.setTimeout(() => setRendered(false), 220);
  }

  function dismiss() {
    try { window.sessionStorage.setItem(dismissedKey, "yes"); } catch { /* Storage can be unavailable. */ }
    close();
  }

  if (!rendered) return null;
  return <aside className="cookie-consent" data-visible={visible} role="region" aria-label="Cookie preferences">
    <div className="cookie-consent-icon"><ShieldCheck size={20} aria-hidden="true" /></div>
    <div className="cookie-consent-copy"><strong>Your privacy matters.</strong><p>We use cookies to support your experience. Choose whether to allow optional cookies.</p><small>No optional analytics or marketing cookies are active. {choice ? `Current choice: ${choice === "accepted" ? "Accept Cookies" : "Reject Optional"}.` : ""}</small></div>
    <div className="cookie-consent-actions"><button type="button" className="cookie-consent-accept" onClick={() => decide("accepted")}>Accept Cookies</button><button type="button" className="cookie-consent-reject" onClick={() => decide("rejected")}>Reject Optional</button></div>
    <button type="button" className="cookie-consent-close" aria-label="Close cookie notice" onClick={dismiss}><X size={16} aria-hidden="true" /></button>
  </aside>;
}
