import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { hasClerkConfiguration } from "@/lib/clerk-config";
import { DashboardConfigurationRequired } from "@/components/dashboard/dashboard-access-state";
import { BrandSymbol } from "@/components/brand/brand-symbol";

export const metadata = { title: "Task Poster registration | UniWorkSL" };

export default function SignUpPage() {
  if (!hasClerkConfiguration()) return <DashboardConfigurationRequired />;
  return <main id="main-content" className="sign-in-page"><div className="sign-in-panel"><Link href="/" className="sign-in-back"><ArrowLeft size={15} aria-hidden="true" /><BrandSymbol className="sign-in-brand-mark" /> UniWorkSL</Link><SignUp signInUrl="/sign-in" forceRedirectUrl="/dashboard/onboarding" /></div></main>;
}
