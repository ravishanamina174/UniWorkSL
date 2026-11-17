import { QRCodeSVG } from "qrcode.react";
import { ArrowDownToLine, Smartphone } from "lucide-react";
import { Container } from "@/components/ui/container";

export function getApkUrl(environment: Record<string, string | undefined> = process.env): string | null {
  const value = environment.NEXT_PUBLIC_ANDROID_APK_URL?.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function DownloadSection() {
  const apkUrl = getApkUrl();
  return (
    <section id="student-app" className="section download-section" aria-labelledby="download-title">
      <Container className="download-layout">
        <div className="download-copy"><p className="eyebrow">05 / FOR STUDENTS</p><div className="download-icon"><Smartphone size={22} aria-hidden="true" /></div><h2 id="download-title">Your next opportunity<br />starts on your phone.</h2><p>Explore local task opportunities, apply when the work suits you, and keep track of your accepted tasks in the student app.</p>
          {apkUrl ? <a className="button button-primary download-button" href={apkUrl} download><ArrowDownToLine size={17} aria-hidden="true" /> Download Student App</a> : <span className="coming-soon-badge" aria-label="Student app download coming soon">Coming Soon</span>}
          <small>For university students · Android</small>
        </div>
        <div className="download-qr-panel">
          {apkUrl ? <><div className="qr-frame"><QRCodeSVG value={apkUrl} size={166} level="M" marginSize={2} title="Scan to download the UniWork student Android app" /></div><p>Scan to open the Android app download</p><span>Use your phone camera</span></> : <><div className="qr-placeholder"><div className="qr-placeholder-mark"><Smartphone size={27} /></div><span>QR CODE</span><span>AVAILABLE SOON</span></div><p>App download is being prepared</p><span>The APK and QR code will appear here when ready.</span></>}
        </div>
      </Container>
    </section>
  );
}
