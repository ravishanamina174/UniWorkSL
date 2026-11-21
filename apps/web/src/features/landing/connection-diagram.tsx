"use client";

import { useEffect, useRef, useState } from "react";
import { Clock3, MapPin, MessagesSquare, ShieldCheck } from "lucide-react";
import { BrandSymbol } from "@/components/brand/brand-symbol";
import { Container } from "@/components/ui/container";

const challenges = [
  { title: "Scattered job posts", detail: "Opportunities spread across social groups and messages.", icon: MessagesSquare, color: "blue" },
  { title: "Unclear safety details", detail: "Limited context before meeting for physical work.", icon: ShieldCheck, color: "purple" },
  { title: "Rigid work schedules", detail: "Part-time hours that compete with university studies.", icon: Clock3, color: "amber" },
  { title: "Hard to find local help", detail: "Nearby people struggle to find suitable workers.", icon: MapPin, color: "green" },
];

export function ConnectionDiagram() {
  const section = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) { const timer = globalThis.setTimeout(() => setEntered(true), 0); return () => globalThis.clearTimeout(timer); }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setEntered(true); observer.disconnect(); } }, { threshold: .18 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <section ref={section} className={`section connection-section${entered ? " entered" : ""}`} aria-labelledby="connection-title"><Container><div className="connection-heading"><p className="eyebrow">ONE CONNECTED MARKETPLACE</p><h2 id="connection-title" className="section-title">Different challenges.<br /><span className="accent-text">One UniWorkSL.</span></h2><p>Finding flexible work and reliable local help shouldn’t depend on scattered posts and endless searching. UniWorkSL brings students and Task Posters together in one connected marketplace.</p></div><div className="connection-visual"><div className="connection-sources">{challenges.map(({ title, detail, icon: Icon, color }) => <div className={`connection-source ${color}`} key={title}><span className="connection-icon"><Icon size={23} aria-hidden="true" /></span><div><h3>{title}</h3><p>{detail}</p></div></div>)}</div><svg className="connection-lines" viewBox="0 0 420 440" preserveAspectRatio="none" fill="none" aria-hidden="true"><path className="blue" d="M0 52 C165 52 150 215 420 220" /><path className="purple" d="M0 164 C150 164 175 215 420 220" /><path className="amber" d="M0 276 C150 276 175 225 420 220" /><path className="green" d="M0 388 C165 388 150 225 420 220" /></svg><div className="connection-destination"><span className="connection-brand"><BrandSymbol className="brand-mark" /><strong>UniWorkSL</strong></span><h3>One connected task marketplace.</h3><p>Local opportunities for students. Practical help for Task Posters.</p></div></div></Container></section>;
}
