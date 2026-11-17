import { ArrowUpRight, Check, CircleUserRound, MapPin, MessageSquareText, Plus } from "lucide-react";
import { BrandSymbol } from "@/components/brand/brand-symbol";

export function HeroPreview() {
  return (
    <div className="preview-wrap" aria-label="Illustrative preview of UniWork dashboard and mobile app">
      <div className="preview-window">
        <div className="preview-window-bar"><div className="window-dots"><i /><i /><i /></div><span>uniwork.lk / workspace</span><BrandSymbol className="preview-window-mark" /></div>
        <div className="preview-workspace">
          <aside className="preview-sidebar"><div className="preview-logo"><BrandSymbol /> UniWorkSL</div><p>WORKSPACE</p><div className="preview-nav-active"><span /> Overview</div><div className="preview-nav-item"><span /> Posted tasks</div><div className="preview-nav-item"><span /> Applications</div><div className="preview-sidebar-bottom"><CircleUserRound size={15} /> Task Poster</div></aside>
          <div className="preview-content"><div className="preview-crumb">Workspace <span>/</span> Overview</div><div className="preview-title-row"><div><small>YOUR WORKSPACE</small><h3>Make local work happen.</h3></div><span className="preview-add"><Plus size={14} /> Post a task</span></div>
            <div className="preview-welcome"><div><small>A SIMPLE START</small><strong>Share a task with<br />your community.</strong><span>Describe what needs doing and where.</span></div><div className="preview-welcome-icon"><MessageSquareText size={27} /></div></div>
            <div className="preview-steps"><div><span>01</span><strong>Describe the work</strong><Check size={14} /></div><div><span>02</span><strong>Review applications</strong><ArrowUpRight size={14} /></div><div><span>03</span><strong>Coordinate directly</strong><MapPin size={14} /></div></div>
          </div>
        </div>
        <div className="preview-caption"><span className="preview-caption-dot" /> Interface preview <span>·</span> Illustrative, no live task data</div>
      </div>
      <div className="preview-mobile" aria-hidden="true"><div className="mobile-notch" /><div className="mobile-brand"><BrandSymbol className="mobile-brand-mark" /> UniWorkSL <i /></div><small>FIND LOCAL OPPORTUNITIES</small><h3>Work that fits<br />your day.</h3><div className="mobile-preview-line" /><div className="mobile-preview-tags"><span>Gardening</span><span>Events</span></div><div className="mobile-tabbar"><i /><i /><i /></div></div>
      <span className="preview-spark preview-spark-one" aria-hidden="true">✳</span><span className="preview-spark preview-spark-two" aria-hidden="true">✳</span>
    </div>
  );
}
