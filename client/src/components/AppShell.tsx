/** Mobile-first shell: only play, quick-match, and friend-room actions remain. */
import { Dices, Gamepad2, Shuffle, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

const navItems = [
  { href: "/play", label: "بازی", icon: Gamepad2 },
  { href: "/play?mode=random", label: "تصادفی", icon: Shuffle },
  { href: "/play?mode=friends", label: "دوستان", icon: UsersRound },
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
    <nav className="mobile-nav simple-mobile-nav" aria-label="ناوبری بازی">
      {navItems.map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={`mobile-nav-link ${current === href ? "is-active" : ""}`}><Icon size={20} strokeWidth={1.9} /><span>{label}</span></Link>)}
      <span className="nav-dice-mark"><Dices size={16} /></span>
    </nav>
  </div>;
}
