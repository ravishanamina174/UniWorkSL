"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";

const questions = [
  { question: "What is UniWorkSL, and who can use it?", answer: "UniWorkSL connects Sri Lankan university students with people and businesses offering short, local paid tasks. Students use the Android app to find opportunities, while Task Posters use the web platform to publish and manage work." },
  { question: "How can students find and apply for tasks?", answer: "Students can explore available tasks in the Android Marketplace, filter by location, date, and payment, review task details, and apply. Task Posters review applications and select suitable students." },
  { question: "How are students kept safe during physical tasks?", answer: "UniWorkSL provides task details, start-code verification, safety reporting, and optional SafeTask guardian location sharing. These tools support safer coordination but cannot guarantee personal safety or verify every participant’s identity." },
  { question: "How do students receive payment?", answer: "Students and Task Posters arrange payment directly. UniWorkSL does not process or hold payments. Students can report missing or incorrect payments through the platform’s dispute process." },
  { question: "Does UniWorkSL charge students or Task Posters?", answer: "A fee policy has not been established in the current project documentation. Any applicable fees or future changes will be communicated clearly before they take effect." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return <section className="section faq-section" aria-labelledby="faq-title"><Container className="faq-layout"><div className="faq-intro"><p className="eyebrow">07 / FREQUENTLY ASKED QUESTIONS</p><h2 id="faq-title" className="section-title">Good questions.<br /><span className="accent-text">Clear answers.</span></h2><p>What to know before you post or apply.</p></div><div className="faq-list">{questions.map(({ question, answer }, index) => <article className="faq-item" key={question}><h3><button type="button" aria-expanded={open === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(open === index ? null : index)}><span>{question}</span><Plus aria-hidden="true" size={20} className={open === index ? "faq-plus open" : "faq-plus"} /></button></h3><div id={`faq-answer-${index}`} className={open === index ? "faq-answer open" : "faq-answer"} inert={open !== index}><div><p>{answer}</p></div></div></article>)}</div></Container></section>;
}
