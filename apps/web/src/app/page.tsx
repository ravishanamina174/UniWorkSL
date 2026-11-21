import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { HeroPreview } from "@/features/landing/hero-preview";
import { DownloadSection } from "@/features/landing/download-section";
import { HeroImage } from "@/features/landing/hero-image";
import { AboutIllustrations } from "@/features/landing/about-illustrations";
import { ConnectionDiagram } from "@/features/landing/connection-diagram";
import { FaqSection } from "@/features/landing/faq-section";
import { CookieConsent } from "@/components/navigation/cookie-consent";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Sprout, Paintbrush, Truck, Camera, PartyPopper, Flower2, MapPin, ShieldCheck, UsersRound, ArrowDownRight } from "lucide-react";
import type { Metadata } from "next";
import "@/features/landing/landing-refinements.css";

export const metadata: Metadata = {
  title: "UniWorkSL | Local tasks, student opportunity",
  description: "UniWork connects Sri Lankan university students with people who need help with small, physical tasks.",
};

const categories = [
  { title: "Gardening", detail: "Help with garden care and outdoor work.", icon: Sprout },
  { title: "Painting", detail: "Support small painting and refresh projects.", icon: Paintbrush },
  { title: "Moving", detail: "Lend a hand with moving and arranging items.", icon: Truck },
  { title: "Event assistance", detail: "Help prepare and support local events.", icon: PartyPopper },
  { title: "Photography", detail: "Bring a creative eye to local occasions.", icon: Camera },
  { title: "Decorations", detail: "Assist with flowers and event decoration.", icon: Flower2 },
];

const steps = [
  { number: "01", title: "Post a task", detail: "Task Posters describe the work, timing, offered amount, and location." },
  { number: "02", title: "Review applications", detail: "Students discover opportunities in the mobile app and apply to suitable tasks." },
  { number: "03", title: "Coordinate in person", detail: "The poster selects a student and both coordinate the work directly." },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="uniwork-landing">
        <section className="hero-section" aria-labelledby="hero-title">
          <HeroImage />
          <Container className="hero-layout">
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> UNIWORK SRI LANKA</p>
              <h1 id="hero-title">Small tasks.<br /><span>Bigger possibilities.</span></h1>
              <p className="hero-description">Connecting Sri Lankan university students with meaningful local earning opportunities.</p>
              <div className="hero-actions">
                <ButtonLink href="#student-app" variant="light">Download Student App <ArrowDownRight size={17} aria-hidden="true" /></ButtonLink>
                <ButtonLink href="/dashboard" variant="dark-outline">Post a Task <ArrowDownRight size={17} aria-hidden="true" /></ButtonLink>
              </div>
              <p className="hero-note"><MapPin size={15} aria-hidden="true" /> Built around work that happens locally</p>
            </div>
            <HeroPreview />
          </Container>
          <div className="hero-bottom-rule" />
        </section>

      <section id="about" className="section about-section" aria-labelledby="about-title">
          <Container className="about-layout">
            <div>
              <p className="eyebrow">01 / WHY UNIWORK</p>
              <h2 id="about-title" className="section-title">A simple way to<br /><span className="accent-text">find a helping hand.</span></h2>
            </div>
            <div className="about-copy">
              <p>Some jobs are too small for a formal service but still need a reliable person nearby. UniWork gives Task Posters a place to share that work and gives university students a way to find local opportunities around their studies.</p>
              <div className="about-points">
                <div><UsersRound size={20} aria-hidden="true" /><span>For local people and university students</span></div>
                <div><MapPin size={20} aria-hidden="true" /><span>Focused on practical, location-based tasks</span></div>
              </div>
            </div>
          </Container>
          <AboutIllustrations />
        </section>

        <ConnectionDiagram />

        <section id="how-it-works" className="section workflow-section" aria-labelledby="workflow-title">
          <Container>
            <div className="section-heading-row">
              <div><p className="eyebrow">02 / HOW IT WORKS</p><h2 id="workflow-title" className="section-title">Two sides. One local connection.</h2></div>
              <p className="section-aside">A clear path from sharing a task to coordinating the work.</p>
            </div>
            <div className="workflow-grid">
              <article className="workflow-panel poster-panel">
                <div className="workflow-panel-heading"><span className="workflow-icon"><UsersRound size={20} aria-hidden="true" /></span><div><h3>For Task Posters</h3><p>Share work that needs doing.</p></div></div>
                <ol className="workflow-list">
                  {steps.map((step) => <li key={step.number}><span className="step-number">{step.number}</span><div><h4>{step.title}</h4><p>{step.detail}</p></div></li>)}
                </ol>
                <ButtonLink href="/dashboard" variant="secondary">Open the Dashboard <ArrowDownRight size={16} aria-hidden="true" /></ButtonLink>
              </article>
              <article className="workflow-panel student-panel">
                <div className="workflow-panel-heading"><span className="workflow-icon"><Sprout size={20} aria-hidden="true" /></span><div><h3>For Students</h3><p>Find a task that fits.</p></div></div>
                <ol className="workflow-list">
                  <li><span className="step-number">01</span><div><h4>Explore opportunities</h4><p>Browse physical tasks shared by people in your area.</p></div></li>
                  <li><span className="step-number">02</span><div><h4>Apply to suitable work</h4><p>Read the details and send an application through the student app.</p></div></li>
                  <li><span className="step-number">03</span><div><h4>Coordinate with the poster</h4><p>If selected, agree on the details and complete the task in person.</p></div></li>
                </ol>
                <ButtonLink href="#student-app" variant="secondary">Student app details <ArrowDownRight size={16} aria-hidden="true" /></ButtonLink>
              </article>
            </div>
          </Container>
        </section>

        <section id="categories" className="section categories-section" aria-labelledby="categories-title">
          <Container>
            <div className="section-heading-row categories-heading">
              <div><p className="eyebrow">03 / EVERYDAY SKILLS</p><h2 id="categories-title" className="section-title">Practical help, in many forms.</h2></div>
              <p className="section-aside">Examples of work that could be shared on UniWork. These are categories, not live listings.</p>
            </div>
            <div className="category-grid">
              {categories.map(({ title, detail, icon: Icon }, index) => <article className="category-item" key={title}><span className="category-number">0{index + 1}</span><Icon size={21} strokeWidth={1.7} aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></article>)}
            </div>
          </Container>
        </section>

        <section id="posters" className="poster-cta-section" aria-labelledby="poster-cta-title">
          <Container className="poster-cta-layout">
            <div><p className="eyebrow">04 / FOR TASK POSTERS</p><h2 id="poster-cta-title">Your next pair of hands<br />could be just around<br />the corner.</h2></div>
            <div className="poster-cta-copy"><p>Describe a task, review student applications, and coordinate the work from one dedicated dashboard.</p><ul><li><span>01</span> Share a task with clear details</li><li><span>02</span> Review who has applied</li><li><span>03</span> Coordinate directly with your selected student</li></ul><ButtonLink href="/dashboard" variant="light">Open Dashboard <ArrowDownRight size={17} aria-hidden="true" /></ButtonLink></div>
          </Container>
        </section>

        <DownloadSection />

        <section id="safety" className="section safety-section" aria-labelledby="safety-title">
          <Container className="safety-layout">
            <div><p className="eyebrow">06 / SAFETY & TRUST</p><h2 id="safety-title" className="section-title">Clear expectations<br />make better work.</h2></div>
            <div className="safety-copy"><p>Task execution uses a poster-provided start code. After verifying it, a Student may share one foreground arrival-location check. Reviews and private safety reports are available after task coordination.</p><p>These tools do not verify a person’s identity or guarantee a task outcome. Payments are arranged directly between the Task Poster and student; UniWork does not handle or protect payments in Version 1.</p><div className="safety-note"><ShieldCheck size={20} aria-hidden="true" /><span>Stay clear about the task, timing, location, and payment with the other person before work begins.</span></div></div>
          </Container>
        </section>
        <FaqSection />
      </main>
      {/* {process.env.NODE_ENV !== "production" ? <div className="dev-diagnostic-slot"><DevelopmentHealthDiagnostic /></div> : null} */}
      <SiteFooter />
      <CookieConsent />
    </>
  );
}
