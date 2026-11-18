import {
  ArrowUpRight, BatteryFull, BriefcaseBusiness, Check, ChevronLeft, ChevronRight,
  CircleUserRound, FileText, LayoutDashboard, LockKeyhole, MapPin, Plus, Search,
  Signal, Sprout, Wifi,
} from "lucide-react";
import { BrandSymbol } from "@/components/brand/brand-symbol";

export function HeroPreview() {
  return (
    <div className="preview-wrap" role="img" aria-label="Illustrative UniWorkSL dashboard and Android marketplace preview, showing an example gardening task. No live task data.">
      <div className="preview-window" aria-hidden="true">
        <div className="preview-window-bar">
          <div className="window-dots"><i /><i /><i /></div>
          <div className="preview-browser-history"><ChevronLeft /><ChevronRight /></div>
          <div className="preview-address"><LockKeyhole /> uniwork.lk / workspace</div>
          <div className="preview-browser-tools"><Plus /><LayoutDashboard /></div>
        </div>
        <div className="preview-workspace">
          <aside className="preview-sidebar">
            <div className="preview-logo"><BrandSymbol /> UniWorkSL</div>
            <p>WORKSPACE</p>
            <div className="preview-nav-active"><LayoutDashboard /> Overview</div>
            <div className="preview-nav-item"><BriefcaseBusiness /> Posted tasks</div>
            <div className="preview-nav-item"><FileText /> Applications</div>
            <div className="preview-sidebar-bottom"><CircleUserRound /><div>Task Poster<small>Personal workspace</small></div></div>
          </aside>
          <div className="preview-content">
            <div className="preview-crumb">Workspace <ChevronRight /> Overview <span className="preview-example-label">EXAMPLE PREVIEW</span></div>
            <div className="preview-title-row">
              <div><small>YOUR WORKSPACE</small><h3>Make local work happen.</h3></div>
              <span className="preview-add"><Plus /> Post a task</span>
            </div>
            <div className="preview-task-detail">
              <div className="preview-task-heading">
                <span className="preview-task-icon"><Sprout /></span>
                <div><small>EXAMPLE TASK</small><strong>Help with a garden refresh</strong></div>
                <span className="preview-status">Draft</span>
              </div>
              <p>Share a task with your community.<br />Describe what needs doing and where.</p>
              <div className="preview-task-meta"><span><MapPin /> Colombo</span><span>Gardening</span><strong>LKR 2,500</strong></div>
            </div>
            <div className="preview-steps">
              <div><span>01</span><strong>Describe the work</strong><Check /></div>
              <div><span>02</span><strong>Review applications</strong><ArrowUpRight /></div>
              <div><span>03</span><strong>Coordinate directly</strong><MapPin /></div>
            </div>
          </div>
        </div>
        <div className="preview-caption"><span className="preview-caption-dot" /> Interface preview <span>·</span> Illustrative, no live task data</div>
      </div>
      <div className="preview-mobile" aria-hidden="true">
        <div className="mobile-notch" />
        <div className="mobile-status"><span>9:41</span><div><Signal /><Wifi /><BatteryFull /></div></div>
        <div className="mobile-brand"><BrandSymbol className="mobile-brand-mark" /> UniWorkSL</div>
        <small>FIND LOCAL OPPORTUNITIES</small>
        <h3>Work that fits<br />your day.</h3>
        <div className="mobile-search"><Search /> Explore local tasks</div>
        <div className="mobile-task-card">
          <div className="mobile-task-heading"><Sprout /><span>EXAMPLE TASK</span></div>
          <strong>Garden refresh</strong>
          <span className="mobile-task-location"><MapPin /> Colombo</span>
          <b>LKR 2,500</b>
          <div className="mobile-preview-tags"><span>Gardening</span><span>Outdoors</span></div>
        </div>
        <div className="mobile-tabbar"><span><Search />Explore</span><span><BriefcaseBusiness />Applied</span><span><CircleUserRound />Profile</span></div>
        <div className="mobile-gesture" />
      </div>
    </div>
  );
}
