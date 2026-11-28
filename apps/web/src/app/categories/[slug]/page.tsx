import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Star, ArrowLeft } from "lucide-react";
import { STUDENT_CATEGORIES, type StudentCategory } from "@uniwork/api-contracts";
import { getApiBaseUrl } from "@/lib/env";

type PublicStudent = { userId: string; name: string; primaryArea: string | null; summary: string | null; primaryCategory: StudentCategory; rating: number; reviewCount: number; nicReviewed: boolean };
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = STUDENT_CATEGORIES.find((item) => item.slug === slug);
  if (!category) notFound();
  let students: PublicStudent[] = [];
  try { const response = await fetch(`${getApiBaseUrl()}/api/v1/public/categories/${category.value}/students`, { next: { revalidate: 60 } }); if (response.ok) students = await response.json(); } catch { students = []; }
  return <main className="public-directory"><Link href="/" className="text-link"><ArrowLeft size={15} /> Back to UniWork</Link><header className="public-directory-heading"><p className="eyebrow">STUDENT DIRECTORY</p><h1>{category.label}</h1><p>Discover students who are ready to help with local work in this category.</p></header>{students.length ? <div className="public-student-grid">{students.map((student) => <Link className="public-student-card" href={`/students/${student.userId}`} key={student.userId}><div className="public-student-card-top"><div><h2>{student.name}</h2><p>{student.primaryArea || "Sri Lanka"}</p></div>{student.nicReviewed ? <span className="public-verified"><BadgeCheck size={15} /> NIC Reviewed</span> : null}</div><p>{student.summary || "This student has not added a public summary yet."}</p><div className="public-student-rating">{student.reviewCount ? <><Star size={15} fill="currentColor" /> {student.rating.toFixed(1)}/5 ({student.reviewCount} reviews)</> : "New"}</div></Link>)}</div> : <div className="public-directory-empty"><h2>No students listed yet</h2><p>New profiles in this category will appear here when they choose to be discoverable.</p></div>}</main>;
}
