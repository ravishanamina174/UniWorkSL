import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Star, ArrowLeft } from "lucide-react";
import { getApiBaseUrl } from "@/lib/env";
import { STUDENT_CATEGORIES } from "@uniwork/api-contracts";

export default async function StudentPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let student: PublicStudent;
  try { const response = await fetch(`${getApiBaseUrl()}/api/v1/public/students/${id}`, { next: { revalidate: 60 } }); if (!response.ok) notFound(); student = await response.json(); } catch { notFound(); }
  const category = STUDENT_CATEGORIES.find((item) => item.value === student.primaryCategory);
  return <main className="public-directory"><Link href={category ? `/categories/${category.slug}` : "/"} className="text-link"><ArrowLeft size={15} /> Back to directory</Link><article className="public-profile-card"><div className="public-profile-heading"><div><p className="eyebrow">PUBLIC STUDENT PROFILE</p><h1>{student.name}</h1><p>{student.primaryArea || "Sri Lanka"} · {category?.label || "Student"}</p></div>{student.nicReviewed ? <span className="public-verified"><BadgeCheck size={16} /> NIC Reviewed</span> : null}</div><p className="public-profile-summary">{student.summary || "This student has not added a public summary yet."}</p><div className="public-student-rating">{student.reviewCount ? <><Star size={16} fill="currentColor" /> {student.rating.toFixed(1)}/5 ({student.reviewCount} reviews)</> : "New"}</div><p className="public-profile-note">This profile is for discovery only. Contact and identity details remain private.</p></article></main>;
}

type PublicStudent = { name: string; primaryArea: string | null; summary: string | null; primaryCategory: string; rating: number; reviewCount: number; nicReviewed: boolean };
