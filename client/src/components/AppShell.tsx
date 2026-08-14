/**
 * Mobile Arena design reminder: every screen is a one-handed, single-column
 * game surface. Navigation is always thumb-reachable at the bottom.
 */
import { Link, useLocation } from "wouter";
import {
  Bell,
  Gamepad2,
  Gem,
  Gift,
  Home,
  LayoutGrid,
  Medal,
  ShoppingBag,
  Swords,
  Trophy,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "./BrandMark";

type NavItem = { href: string; label: string; icon: typeof Home; badge?: string };

const navItems: NavItem[] = [
  { href: "/", label: "نمای کلی", icon: Home },
  { href: "/play", label: "بازی", icon: Gamepad2, badge: "زنده" },
  { href: "/leagues", label: "لیگ‌ها", icon: Medal },
  { href: "/leaderboard", label: "رتبه‌بندی", icon: Trophy },
  { href: "/season", label: "فصل", icon: LayoutGrid },
  { href: "/rewards", label: "جوایز", icon: Gift },
  { href: "/shop", label: "فروشگاه", icon: ShoppingBag },
  { href: "/friends", label: "دوستان", icon: Users },
  { href: "/tournaments", label: "مسابقات", icon: Swords },
  { href: "/promo", label: "کد جایزه", icon: Gem },
];

const mobileItems = navItems.filter((item) => ["/", "/play", "/leagues", "/rewards"].includes(item.href));

export function AppShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const [location] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="arena-app">
      <main className="main-stage">
        <header className="topbar">
          <div className="page-heading">
            <span className="eyebrow"><i /> {eyebrow}</span>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <Link href="/" className="mobile-brand"><BrandMark /></Link>
            <button className="wallet-chip" onClick={() => toast("فروشگاه سکه در دسترس است", { description: "یک بسته را از فروشگاه انتخاب کنید." })}>
              <span className="coin">◒</span><b>8,240</b><small>سکه</small>
            </button>
            <button className="wallet-chip gem-chip" onClick={() => toast("۳۴ الماس در کیف شماست")}>
              <Gem size={17} fill="currentColor" /><b>34</b>
            </button>
            <div className="notification-wrap">
              <button className={`icon-button bell-button ${notificationsOpen ? "is-open" : ""}`} aria-label="اعلان‌ها" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell size={19} /><span className="notification-count">3</span>
              </button>
              {notificationsOpen && (
                <section className="notification-panel" aria-label="فهرست اعلان‌ها">
                  <div className="panel-title"><b>اعلان‌ها</b><button aria-label="بستن" onClick={() => setNotificationsOpen(false)}><X size={16} /></button></div>
                  <button className="notification-row"><span className="notif-icon amber">✦</span><span><b>پاداش روزانه آماده است</b><small>همین حالا دریافتش کن.</small></span></button>
                  <button className="notification-row"><span className="notif-icon blue">↗</span><span><b>یک قدم تا Platinum</b><small>۱۲۰ امتیاز تا لیگ بعدی.</small></span></button>
                  <button className="notification-row"><span className="notif-icon green">●</span><span><b>کیان آنلاین شد</b><small>دعوت او برای بازی دوستانه.</small></span></button>
                </section>
              )}
            </div>
            <Link href="/profile" className="header-profile"><span className="header-avatar">آ</span><span className="chevron">⌄</span></Link>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>

      <nav className="mobile-nav" aria-label="ناوبری موبایل">
        {mobileItems.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href} className={`mobile-nav-link ${location === href ? "is-active" : ""}`}>
            <Icon size={20} strokeWidth={1.9} /><span>{label}</span>
          </Link>
        ))}
        <Link href="/profile" className={`mobile-nav-link ${location === "/profile" ? "is-active" : ""}`}>
          <UserRound size={20} strokeWidth={1.9} /><span>پروفایل</span>
        </Link>
      </nav>
    </div>
  );
}
