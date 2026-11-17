import { HealthStatus } from "@/features/health/health-status";
import { BorderedContainer } from "@/components/ui/bordered-container";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
      <p className="text-sm font-semibold tracking-wide text-[var(--accent)]">UNIWORK · SRI LANKA</p>
      <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-7xl">Local work.<br />Student opportunity.</h1>
      <p className="mt-6 max-w-xl text-lg text-[var(--muted)]">UniWork connects university students with people who need help completing small, physical tasks in their communities.</p>
      <BorderedContainer className="mt-12 max-w-xl p-5">
        <h2 className="text-sm font-semibold">Foundation status</h2>
        <p className="mt-1 mb-4 text-sm text-[var(--muted)]">This page checks the live UniWork backend health endpoint.</p>
        <HealthStatus />
      </BorderedContainer>
      <p className="mt-8 text-xs text-[var(--muted)]">A shared platform for Task Posters on web and students on mobile.</p>
    </main>
  );
}
