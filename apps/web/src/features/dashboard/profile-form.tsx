"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Gender, TaskPosterProfile } from "@uniwork/api-contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthenticatedApi } from "./use-api";

const genders: Array<{ value: Gender; label: string }> = [
  { value: "FEMALE", label: "Female" }, { value: "MALE", label: "Male" }, { value: "OTHER", label: "Other" }, { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export function ProfileForm({ initial, onboarding = false }: { initial?: TaskPosterProfile; onboarding?: boolean }) {
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      phoneNumber: String(form.get("phoneNumber") ?? "").trim(),
      nic: String(form.get("nic") ?? "").trim(),
      gender: String(form.get("gender") ?? "") as Gender,
    };
    try {
      await api<TaskPosterProfile>("/api/v1/poster/profile", { method: "PUT", body: JSON.stringify(payload) });
      router.replace(onboarding ? "/dashboard" : "/dashboard/profile");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your profile could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return <form className="dashboard-form" onSubmit={handleSubmit}>
    <section className="form-section"><div className="form-section-heading"><h2>Personal information</h2><p>Only you can view and update these details.</p></div>
      <div className="form-grid">
        <label className="form-field form-field-full"><span>Full Name</span><Input name="fullName" autoComplete="name" maxLength={160} required defaultValue={initial?.fullName ?? ""} /></label>
        <label className="form-field"><span>Phone Number</span><Input name="phoneNumber" type="tel" inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" pattern="(?:\\+94|0)7[0-9]{8}" required defaultValue={initial?.phoneNumber ?? ""} /></label>
        <label className="form-field"><span>NIC</span><Input name="nic" autoComplete="off" maxLength={12} pattern="(?:[0-9]{9}[vVxX]|[0-9]{12})" required defaultValue={initial?.nic ?? ""} /><small>Stored encrypted. Visible only in your authenticated profile.</small></label>
        <label className="form-field form-field-full"><span>Address</span><Input name="address" autoComplete="street-address" maxLength={500} required defaultValue={initial?.address ?? ""} /></label>
        <label className="form-field"><span>Gender</span><select className="ui-input" name="gender" required defaultValue={initial?.gender ?? ""}><option value="" disabled>Select an option</option>{genders.map((gender) => <option key={gender.value} value={gender.value}>{gender.label}</option>)}</select></label>
      </div>
    </section>
    {error ? <div className="form-alert" role="alert">{error}</div> : null}
    <div className="form-actions"><Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Saving…" : onboarding ? "Complete profile" : "Save changes"}</Button></div>
  </form>;
}
