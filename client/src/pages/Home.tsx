/**
 * Arena After Dark dashboard: strong amber action, editorial hierarchy, and
 * an asymmetric tournament tableau pull focus to the next decisive match.
 */
import { Link, useLocation } from "wouter";
import { CalendarDays, ChevronLeft, Crown, Gamepad2, Gift, ShieldCheck, Swords, Trophy, UsersRound, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { LudoBoard } from "@/components/LudoBoard";

const modes = [
  { title: "بازی سریع", text: "حریف آماده، شروع بی‌وقفه", players: "۴ بازیکن", icon: Zap, route: "/play" },
  { title: "دوستانه", text: "یک میز برای دوستان نزدیک", players: "دعوت دوست", icon: UsersRound, route: "/friends" },
  { title: "رقابتی", text: "هر بازی، یک قدم تا صعود", players: "رتبه‌دار", icon: Trophy, route: "/leagues" },
];

export default function Home() {
  const [, navigate] = useLocation();
  return (
    <AppShell title="میز بعدی" eyebrow="پخش زندهٔ آرنا">
      <section className="dashboard-hero premium-panel">
        <div className="hero-score-rail"><span className="mono">LIVE 04</span><i /><b>نوبت رقابت</b><em className="mono">12:08</em></div>
        <div className="hero-diamond-seal" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="hero-copy">
          <span className="hero-kicker"><span>●</span> <b className="mono">1,248</b> بازیکن در صف رقابت</span>
          <h2>حرکت اول را حساب‌شده بردار.</h2>
          <p>میز باز است؛ یک تصمیم دقیق، فاصله‌ات تا Platinum را کم می‌کند.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate("/play")}><Gamepad2 size={17} /> ورود به میز</button>
            <button className="ghost-button" onClick={() => navigate("/tournaments")}><Swords size={16} /> جدول امروز</button>
          </div>
          <div className="hero-footnote"><span className="online-pips"><i /><i /><i /><i /></span> چهار بازیکن مناسب همین حالا آنلاین‌اند.</div>
        </div>
        <div className="hero-board-spot"><LudoBoard compact /></div>
      </section>

      <div className="section-title-row"><div><h2>انتخاب میز</h2><p>ریتم بازی را تو تعیین می‌کنی.</p></div><Link className="text-link" href="/play">همهٔ میزها <ChevronLeft size={14} /></Link></div>
      <section className="mode-grid">
        <div className="mode-command-band"><span className="mono">MODE SELECT // 03</span><b>سه میز آمادهٔ ورود</b><i /><small>حالت مناسب را انتخاب کن</small></div>
        {modes.map(({ title, text, players, icon: Icon, route }) => <article className="mode-card" key={title}><div className="mode-icon"><Icon size={18} /></div><h3>{title}</h3><p>{text}</p><footer><span>{players}</span><button className="play-card-button" onClick={() => navigate(route)}>ورود</button></footer></article>)}
      </section>

      <section className="stats-season-grid">
        <article className="premium-panel stat-panel">
          <header><div className="panel-label">امتیاز پخش زنده<b>جریان بازی تو</b></div><span className="status-badge active">روند صعودی</span></header>
          <div className="stat-grid">
            <div className="stat-item"><span>بازی‌ها</span><b className="stat-number">186</b></div><div className="stat-item"><span>بردها</span><b className="stat-number">112</b></div><div className="stat-item"><span>نرخ برد</span><b className="stat-number">60<em>%</em></b></div><div className="stat-item"><span>بهترین برد</span><b className="stat-number">9</b></div>
          </div>
        </article>
        <article className="premium-panel season-mini">
          <header><div><h3>Season 12<span>Royal Battle</span></h3></div><span className="season-rank">#184</span></header>
          <div className="season-foot"><div><small>تا پایان فصل</small><b className="mono">12d 08h</b></div><button className="primary-button" onClick={() => navigate("/season")}>مشاهده فصل</button></div>
        </article>
      </section>

      <section className="mission-list">
        <article className="premium-panel daily-missions"><div className="section-title-row" style={{ margin: "0 0 4px" }}><div><h2>ماموریت‌های امروز</h2><p>تا ساعت ۲۴ فرصت داری.</p></div><button className="text-link" onClick={() => toast("پاداش روزانه به کیف شما اضافه شد", { description: "+100 سکه" })}>دریافت روزانه</button></div>
          {["سه بازی انجام بده", "یک بازی رقابتی برنده شو", "با یک دوست بازی کن"].map((mission, index) => <div className="daily-mission" key={mission}><span className="mission-check">{index === 0 ? "✓" : index + 1}</span><div><b>{mission}</b><small>{index === 0 ? "3 / 3 · کامل شده" : index === 1 ? "0 / 1 · در حال انجام" : "0 / 1 · در انتظار"}</small></div><span className="mission-reward">+{index === 0 ? "80" : "45"} ◒</span></div>)}
        </article>
        <article className="premium-panel activity-card"><h3>فرمان بعدی</h3><div className="activity-row"><span className="activity-dot" /><div><b>Weekend Championship</b><small><CalendarDays size={10} /> شروع در ۲ ساعت و ۱۸ دقیقه</small></div></div><div className="activity-row"><span className="activity-dot" style={{ background: "var(--arena-blue)", boxShadow: "0 0 0 4px rgba(92,167,250,.12)" }} /><div><b>لیگ Gold II</b><small>۱۲۰ امتیاز تا Platinum</small></div></div><button className="surface-button" style={{ width: "100%", marginTop: 9 }} onClick={() => navigate("/tournaments")}><Crown size={15} /> ورود به جدول</button></article>
      </section>
      <div className="section-title-row"><div><h2>مرکز پاداش</h2><p>برای بازی منظم، جایزهٔ واقعی بگیر.</p></div><button className="text-link" onClick={() => navigate("/rewards")}>دیدن همه <ChevronLeft size={14} /></button></div>
      <section className="content-grid"><article className="premium-panel mini-card"><div className="card-icon"><Gift size={18} /></div><h3>پاداش روزانه</h3><p>جعبهٔ امروز شامل سکه و یک شانس ویژه است.</p><footer><span className="status-badge warm">آمادهٔ دریافت</span><button className="play-card-button" onClick={() => toast("جعبهٔ روزانه باز شد", { description: "+100 سکه و +1 الماس" })}>باز کن</button></footer></article><article className="premium-panel mini-card"><div className="card-icon"><ShieldCheck size={18} /></div><h3>کد جایزه</h3><p>کدهای رویداد را برای دریافت آیتم خاص فعال کن.</p><footer><span>کد جدید داری؟</span><button className="play-card-button" onClick={() => navigate("/promo")}>فعال‌سازی</button></footer></article><article className="premium-panel mini-card"><div className="card-icon"><Trophy size={18} /></div><h3>دستاوردها</h3><p>۱۸ از ۳۵ نشان را در مسیر حرفه‌ای باز کرده‌ای.</p><footer><span className="mono">18 / 35</span><button className="play-card-button" onClick={() => toast("دستاوردها به‌زودی در پروفایل کامل می‌شوند")}>پروفایل</button></footer></article></section>
    </AppShell>
  );
}
