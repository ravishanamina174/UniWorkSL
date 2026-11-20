import { GuardianPage } from "@/features/safetask/guardian-page";

export const metadata = { title: "Guardian Location Sharing | UniWorkSL", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <GuardianPage token={token} />;
}
