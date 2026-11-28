import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Star, ArrowLeft } from "lucide-react";
import { STUDENT_CATEGORIES, type StudentCategory } from "@uniwork/api-contracts";
import { getApiBaseUrl } from "@/lib/env";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MapPin, ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "@/components/categories/category-icon";

type PublicStudent = { userId: string; name: string; primaryArea: string | null; summary: string | null; primaryCategory: StudentCategory; rating: number; reviewCount: number; nicReviewed: boolean };
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = STUDENT_CATEGORIES.find((item) => item.slug === slug);
  if (!category) notFound();
  let students: PublicStudent[] = [];
  try { const response = await fetch(`${getApiBaseUrl()}/api/v1/public/categories/${category.value}/students`, { next: { revalidate: 60 } }); if (response.ok) students = await response.json(); } catch { students = []; }
  return <><SiteHeader /><main className="public-directory"><Link href="/#top" className="text-link"><ArrowLeft size={15} /> Back to UniWork</Link><header className="public-directory-heading"><span className="public-category-icon"><CategoryIcon category={category.value} size={28} /></span><p className="eyebrow">STUDENT DIRECTORY / {String(STUDENT_CATEGORIES.indexOf(category) + 1).padStart(2, "0")}</p><h1>{category.label}<span className="accent-text">.</span></h1><p>Find students who have chosen {category.label.toLowerCase()} as their primary area of work.</p></header><div className="public-directory-section-head"><h2>Discover local talent</h2><span>{students.length} {students.length === 1 ? "student" : "students"}</span></div>{students.length ? <div className="public-student-grid">{students.map((student) => <Link className="public-student-card" href={`/students/${student.userId}`} key={student.userId}><div className="public-student-card-top"><span className="public-student-avatar">{student.name.slice(0, 1)}</span>{student.nicReviewed ? <span className="public-verified"><BadgeCheck size={15} /> NIC Reviewed</span> : null}</div><div><h2>{student.name}</h2><span className="public-student-area"><MapPin size={14} /> {student.primaryArea || "Sri Lanka"}</span></div><p>{student.summary || "This student has not added a public summary yet."}</p><div className="public-student-card-bottom"><span className="public-student-rating">{student.reviewCount ? <><Star size={15} fill="currentColor" /> {student.rating.toFixed(1)}/5 ({student.reviewCount} reviews)</> : "New"}</span><ArrowUpRight size={18} /></div></Link>)}</div> : <div className="public-directory-empty"><h2>No students listed yet</h2><p>Discoverable profiles in this category will appear here.</p></div>}</main><SiteFooter /></>;
}
