/** Mobile-first shell: only play, quick-match, and friend-room actions remain. */
import { CalendarDays, Gamepad2, Gift, Medal, Trophy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

const navItems = [
  { href: "/play", label: "بازی", icon: Gamepad2 },
  { href: "/leagues", label: "لیگ", icon: Medal },
  { href: "/leaderboard", label: "رتبه", icon: Trophy },
  { href: "/season", label: "فصل", icon: CalendarDays },
  { href: "/rewards", label: "جوایز", icon: Gift },
];

export function AppShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const [location] = useLocation();
  const current = `${location}${typeof window === "undefined" ? "" : window.location.search}`;
  return <div className="arena-app">
    <main className="main-stage">
      <header className="topbar simple-topbar">
        <div className="page-heading"><span className="eyebrow"><i /> {eyebrow}</span><h1>{title}</h1></div>
        <Link href="/play" className="simple-brand" aria-label="مار و پله"><BrandMark /></Link>
      </header>
      <div className="page-content">{children}</div>
    </main>
    <nav className="mobile-nav simple-mobile-nav league-mobile-nav" aria-label="ناوبری رقابتی">
      {navItems.map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={`mobile-nav-link ${current === href ? "is-active" : ""}`}><Icon size={20} strokeWidth={1.9} /><span>{label}</span></Link>)}
    </nav>
  </div>;
}
