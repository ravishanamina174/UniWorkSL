"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, UserRound } from "lucide-react";
import type { TaskPosterProfile } from "@uniwork/api-contracts";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthenticatedApi } from "./use-api";
import { ProfileForm } from "./profile-form";

function useProfile() {
  const api = useAuthenticatedApi();
  const [profile, setProfile] = useState<TaskPosterProfile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void api<TaskPosterProfile>("/api/v1/poster/profile").then((value) => { if (active) setProfile(value); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Profile could not be loaded."); });
    return () => { active = false; };
  }, [api]);
  return { profile, error };
}

export function ProfileViewPage() {
  const { profile, error } = useProfile();
  if (error) return <div className="form-alert" role="alert">{error}</div>;
  if (!profile) return <LoadingState label="Loading your profile" />;
  const maskedNic = `••••••••${profile.nic.slice(-4)}`;
  return <div className="dashboard-content-stack">
    <header className="dashboard-page-head"><div><p className="eyebrow">ACCOUNT</p><h1>Profile</h1><p>Your private Task Poster information.</p></div><ButtonLink href="/dashboard/profile/edit" variant="secondary">Edit profile <ArrowUpRight size={15} /></ButtonLink></header>
    <section className="profile-summary-panel"><span className="empty-state-icon"><UserRound size={20} /></span><div><h2>{profile.fullName}</h2><p>Task Poster</p></div></section>
    <section className="form-section"><div className="form-section-heading"><h2>Personal information</h2><p>Your NIC and home address are only available through this authenticated profile.</p></div>
      <dl className="profile-details"><div><dt>Full Name</dt><dd>{profile.fullName}</dd></div><div><dt>Phone Number</dt><dd>{profile.phoneNumber}</dd></div><div><dt>NIC</dt><dd>{maskedNic}</dd></div><div><dt>Gender</dt><dd>{profile.gender.replaceAll("_", " ").toLowerCase()}</dd></div><div className="profile-detail-full"><dt>Address</dt><dd>{profile.address}</dd></div></dl>
    </section>
  </div>;
}

export function ProfileEditPage() {
  const { profile, error } = useProfile();
  if (error) return <div className="form-alert" role="alert">{error}</div>;
  if (!profile) return <LoadingState label="Loading your profile" />;
  return <div className="dashboard-content-stack"><header className="dashboard-page-head"><div><p className="eyebrow">ACCOUNT</p><h1>Edit profile</h1><p>Update your personal information.</p></div></header><ProfileForm initial={profile} /></div>;
}

export function OnboardingPage() {
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void api<{ completed: boolean }>("/api/v1/poster/profile/status").then((value) => { if (active) setProfileExists(value.completed); }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Your profile status could not be checked.");
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [api]);
  useEffect(() => { if (profileExists) router.replace("/dashboard"); }, [profileExists, router]);
  if (checking || profileExists) return <LoadingState label="Checking your profile" />;
  if (error) return <div className="form-alert" role="alert">{error}</div>;
  return <div className="dashboard-content-stack"><header className="dashboard-page-head"><div><p className="eyebrow">TASK POSTER SETUP</p><h1>Complete your profile</h1><p>Enter the details needed to set up your Task Poster workspace.</p></div><Link className="text-link" href="/">Back to UniWork</Link></header><EmptyState icon={<UserRound size={20} />} title="A few details to get started" description="Your profile is stored securely and is visible only to you." /><ProfileForm onboarding /></div>;
}
