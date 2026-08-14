/**
 * Arena After Dark product views: reusable premium panels preserve one
 * competitive language across gameplay, leagues, rewards, social, and profile.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Award, Check, CircleHelp, Crown, Gift, HelpCircle, Medal, MessageCircle, PackageOpen, RotateCcw, Send, Shield, ShoppingBag, Sparkles, Trophy, Users, Volume2, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { LudoBoard } from "@/components/LudoBoard";
import { GameTutorial } from "@/components/GameTutorial";
import { recordDjangoMove, rollDjangoDice } from "@/lib/gameApi";

const leagues = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Champion"];
const players: [string, string, string][] = [
  ["نیما.ک", "سطح 31", "ن"], ["باران", "سطح 27", "ب"], ["مهرداد", "سطح 29", "م"], ["سارا.م", "سطح 24", "س"],
];

export function Play() {
  const [roll, setRoll] = useState(5);
  const [rolling, setRolling] = useState(false);
  const [moveValue, setMoveValue] = useState(0);
  const [message, setMessage] = useState("");
  const [turnIndex, setTurnIndex] = useState(0);
  const [phase, setPhase] = useState<"roll" | "move" | "opponent">("roll");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tokensInPlay, setTokensInPlay] = useState(0);
  const pipPositions: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const statusCopy = phase === "opponent" ? "حریف در حال انتخاب حرکت" : phase === "move" ? "مهرهٔ درخشان را لمس کن" : "برای شروع، تاس را پرتاب کن";

  const finishTurn = (description: string) => {
    setMoveValue(0);
    setTurnIndex(1);
    setPhase("opponent");
    window.setTimeout(() => {
      setTurnIndex(0);
      setPhase("roll");
      toast("نوبت شماست", { description });
    }, 1350);
  };

  const rollDice = () => {
    if (rolling || phase !== "roll") return;
    setRolling(true);
    setMoveValue(0);
    const djangoRoll = rollDjangoDice("ARENA-DEMO");
    let frames = 0;
    const reel = window.setInterval(() => {
      setRoll(Math.floor(Math.random() * 6) + 1);
      frames += 1;
      if (frames === 9) {
        window.clearInterval(reel);
        void djangoRoll.then((response) => {
          const finalValue = response?.dice_value ?? Math.floor(Math.random() * 6) + 1;
          setRoll(finalValue);
          setRolling(false);
          setMoveValue(finalValue);
          setPhase("move");
          toast(`تاس روی ${finalValue} ایستاد`, { description: "مهرهٔ طلایی را انتخاب کن تا حرکت آغاز شود." });
        });
      }
    }, 84);
  };

  const pips = Array.from({ length: 9 }, (_, index) => <i key={index} className={pipPositions[roll].includes(index) ? "" : "blank"} />);

  return (
    <AppShell title="میز مسابقه" eyebrow="بازی زنده">
      <section className="premium-panel game-room">
        <div className="game-status-strip"><span><i className={phase === "opponent" ? "is-waiting" : ""} />{turnIndex === 0 ? "نوبت شما" : "نوبت حریف"}</span><b>{statusCopy}</b><button onClick={() => setTutorialOpen(true)}><HelpCircle size={15} /> آموزش</button></div>
        <div className="game-score-strip"><span><b>۰</b> مهرهٔ رسیده</span><i /><span><b>{tokensInPlay}</b> مهرهٔ فعال</span><i /><span>راند ۱ از ۳</span></div>
        <aside className="player-stack">
          {players.map(([name, level, initial], index) => <div className={`player-tile ${turnIndex === index ? "is-turn" : ""}`} key={name}><span className="player-avatar">{initial}</span><span><b>{name}</b><small>{level} · Gold II</small></span>{turnIndex === index && <i className="turn-pulse" />}</div>)}
        </aside>
        <div className="game-main"><LudoBoard moveValue={phase === "move" ? moveValue : 0} onMoveComplete={(move) => { const rolledValue = moveValue; if (!move.entered) void recordDjangoMove({ roomCode: "ARENA-DEMO", tokenId: move.tokenId, diceValue: rolledValue, fromStep: move.fromStep, toStep: move.toStep }); if (move.entered) setTokensInPlay((count) => Math.min(4, count + 1)); toast(move.entered ? "مهره وارد مسیر شد" : "حرکت ثبت شد", { description: move.entered ? "با تاس ۶، یک مهرهٔ تازه به مسیر آمد." : `${move.steps} خانه با موفقیت طی شد.` }); finishTurn("حریف حرکتش را تمام کرد؛ دوباره تاس بریز."); }} /></div>
        <aside className="game-controls">
          <article className="premium-panel turn-card">
            <span>{phase === "opponent" ? "نوبت حریف" : moveValue ? "حرکت در انتظار انتخاب مهره" : "نوبت شماست"}</span>
            <h3>{phase === "opponent" ? "حرکت حریف در حال ثبت است" : moveValue ? `مهرهٔ طلایی را ${moveValue} خانه حرکت بده` : "یک حرکت هوشمندانه انتخاب کن"}</h3>
            <div className={`dice ${rolling ? "is-rolling" : ""} ${moveValue ? "has-result" : ""}`}>{pips}</div>
            <button className="primary-button" onClick={rollDice} disabled={rolling || phase !== "roll"}><RotateCcw size={15} /> {rolling ? "در حال چرخش" : phase === "opponent" ? "نوبت حریف" : moveValue ? "مهره را انتخاب کن" : "پرتاب تاس"}</button>
            <div className="game-utility"><button onClick={() => phase === "move" ? finishTurn("حرکت مجاز نداشتی؛ دوباره تاس بریز.") : setTutorialOpen(true)}>{phase === "move" ? "رد نوبت" : "قوانین بازی"}</button><button onClick={() => phase === "move" ? setTutorialOpen(true) : toast("گزارش شما ثبت شد")}>{phase === "move" ? "راهنمای حرکت" : "گزارش مشکل"}</button></div>
          </article>
          <article className="premium-panel chat-card"><header><b>گفت‌وگوی میز</b><span><Volume2 size={11} /> بی‌صدا</span></header><div className="quick-chat">{["حرکت خوب بود!", "نوبت من؟", "موفق باشی"].map(q => <button key={q} onClick={() => toast(q, { description: "پیام سریع ارسال شد." })}>{q}</button>)}</div><form className="chat-compose" onSubmit={(e) => { e.preventDefault(); if (message.trim()) { toast(message, { description: "پیام ارسال شد." }); setMessage(""); } }}><input value={message} onChange={e => setMessage(e.target.value)} placeholder="پیام کوتاه..." /><button aria-label="ارسال"><Send size={14} /></button></form></article>
        </aside>
      </section>
      <GameTutorial open={tutorialOpen} onOpenChange={setTutorialOpen} />
    </AppShell>
  );
}

export function Leagues() { const [, navigate] = useLocation(); return <AppShell title="لیگ‌ها" eyebrow="مسیر صعود"><section className="premium-panel league-hero"><div className="broadcast-band"><span>GOLD II</span><i /><small className="mono">RANK #184</small></div><div className="league-medallion"><Medal /></div><div className="league-summary"><span className="status-badge warm">لیگ فعلی</span><h2>Gold League II</h2><p>با حفظ روند برد، به سطح Platinum نزدیک‌تر می‌شوی. هر برد رقابتی امتیاز لیگ تو را بالا می‌برد.</p><div className="league-score"><b>2,480</b><span>120 امتیاز تا Platinum</span></div><div className="progress-track"><span style={{ width: "74%" }} /></div><button className="primary-button" style={{ marginTop: 16 }} onClick={() => navigate("/play")}>شروع بازی رتبه‌دار</button></div></section><div className="section-title-row"><div><h2>نقشهٔ مسیر</h2><p>هر نشان، نیازمندی و پاداش مخصوص خودش را دارد.</p></div></div><section className="league-ladder">{leagues.map((league, index) => <article className={`ladder-item ${league === "Gold" ? "is-current" : ""}`} key={league}><span className="ladder-mark">{["◒","◈","◆","⬡","✦","✧","♛"][index]}</span><b>{league}</b><small>{index * 750 + 1} — {(index + 1) * 750} امتیاز</small>{league === "Gold" && <span className="status-badge warm" style={{ marginTop: 11 }}>جایگاه شما</span>}</article>)}</section></AppShell>; }

export function Leaderboard() { const [tab, setTab] = useState("جهانی"); const ranks = [["سارا.س", "38", "3,950", "71%"],["کیان.آ", "36", "3,720", "68%"],["آوا.ن", "34", "3,481", "65%"],["آرین.م", "28", "2,480", "60%"],["بهروز", "26", "2,317", "58%"],["نازنین", "25", "2,245", "57%"]]; return <AppShell title="رتبه‌بندی" eyebrow="تالار افتخار"><section className="premium-panel rank-broadcast"><div><span className="broadcast-label">RANKING // LIVE</span><h2>رتبهٔ فعلی تو</h2><p>هر برد مار و پله، تو را در جدول جهانی بالا می‌برد.</p><div className="micro-score-bars"><i /><i /><i /><i /><i /></div></div><div className="rank-focus-number"><b>#184</b><small>Gold II</small></div></section><div className="section-title-row"><div><h2>بازیکنان پیشتاز</h2><p>رتبه‌ها بعد از هر بازی رقابتی به‌روز می‌شوند.</p></div><div className="segmented-tabs">{["جهانی","کشور","دوستان"].map(t => <button key={t} className={tab === t ? "is-active" : ""} onClick={() => setTab(t)}>{t}</button>)}</div></div><section className="premium-panel leaderboard"><div className="leaderboard-head"><span>رتبه</span><span>بازیکن</span><span>لیگ</span><span>امتیاز</span><span>برد</span></div>{ranks.map(([name, level, score, rate], index) => <div className={`leader-row ${index < 3 ? "is-podium" : ""}`} key={name}><span className="rank-chip">{index + 1}</span><span className="player-name"><i className="list-avatar">{name[0]}</i><span><b>{name}</b><small>سطح {level}</small></span></span><span className="league-tag">{index < 2 ? "Diamond" : index === 2 ? "Platinum" : "Gold"}</span><b className="mono">{score}</b><span className="mono">{rate}</span></div>)}</section></AppShell>; }

export function Season() { return <AppShell title="Season 12" eyebrow="Royal Battle"><section className="premium-panel season-page-hero"><div className="broadcast-band"><span>SEASON // 12</span><i /><small className="mono">ROYAL BATTLE</small></div><div><span className="status-badge warm">فصل فعال</span><h2>Royal Battle<span>بازی کن، رتبه بگیر، آیتم‌های این فصل را باز کن.</span></h2><p>این فصل برای بازیکنانی طراحی شده که هر حرکت را جدی می‌گیرند. با انجام ماموریت‌ها، مسیر پاداش اختصاصی را باز کن.</p><div className="countdown"><div><b>12</b><small>روز</small></div><div><b>08</b><small>ساعت</small></div><div><b>26</b><small>دقیقه</small></div></div></div></section><div className="section-title-row"><div><h2>مسیر پاداش</h2><p>سطح‌های کامل‌شده با نشان سبز مشخص‌اند.</p></div><button className="text-link" onClick={() => toast("ماموریت‌های فصل در حال همگام‌سازی‌اند")}>ماموریت‌ها</button></div><section className="premium-panel reward-track">{[[1,"100 سکه",true],[5,"آواتار Royal",true],[10,"اسکین تاس",false],[20,"نشان ویژه",false],[30,"پوستهٔ میز",false],[50,"نشان Champion",false]].map(([level,label,claimed]) => <div className={`reward-step ${claimed ? "is-claimed" : ""}`} key={String(level)}><span className="reward-icon">{claimed ? <Check size={17} /> : <Gift size={17} />}</span><b>سطح {level}</b><small>{label}</small></div>)}</section></AppShell>; }

export function Rewards() { const [collected, setCollected] = useState<string[]>([]); const items = [["جعبهٔ روزانه","100 سکه","روزانه"],["کریستال آرنا","یک آیتم تزئینی","ویژه"],["Dice Skin · Ember","پوستهٔ کمیاب تاس","فصل ۱۲"],["Frame · Gold II","قاب پروفایل","رتبه‌ای"]]; return <AppShell title="مرکز پاداش" eyebrow="مجموعه و جوایز"><section className="reward-broadcast-rail"><span><b>02</b> آیتم آماده</span><i /><span><b>Gold II</b> لیگ فعلی</span><i /><span>SEASON 12</span></section><div className="section-title-row" style={{ marginTop: 0 }}><div><h2>برای بردهای منظم</h2><p>آیتم‌ها را جمع کن و هویت خودت را بساز.</p></div><span className="status-badge active">۲ آیتم آماده</span></div><section className="content-grid">{items.map(([title, description, label], index) => <article className="premium-panel reward-card" key={title}><div className="reward-product">{index === 0 ? <Gift size={43} color="#f2a348" /> : index === 1 ? <span className="diamond-award">◆</span> : index === 2 ? <span className="dice-award">⠿</span> : <span className="frame-award">◇</span>}</div><h3>{title}</h3><p>{description}</p><footer><span className="status-badge cool">{label}</span><button className={collected.includes(title) ? "surface-button" : "primary-button"} onClick={() => { setCollected([...collected, title]); toast(collected.includes(title) ? "این آیتم قبلاً دریافت شده" : "پاداش به موجودی تو اضافه شد", { description: title }); }}>{collected.includes(title) ? "دریافت شد" : "دریافت"}</button></footer></article>)}</section></AppShell>; }

export function Shop() { const products = [["بستهٔ شروع","500","80"],["Arena Pass","1,200","160"],["Crystal Pack","2,500","340"],["Royal Table","پوسته","480"]]; return <AppShell title="فروشگاه" eyebrow="آیتم و سکه"><div className="section-title-row" style={{ marginTop: 0 }}><div><h2>موجودی آراسته برای مسابقه</h2><p>سکه، الماس و آیتم‌های ظاهری را انتخاب کن.</p></div><span className="status-badge cool">امن و آماده</span></div><section className="content-grid">{products.map(([name, content, price], index) => <article className="premium-panel shop-product" key={name}><div className="shop-visual">{name === "Royal Table" ? <Crown size={52} color="#f2a348" /> : <span className={`shop-symbol symbol-${index}`}>{index === 0 ? "◒" : index === 1 ? "◆" : "✦"}</span>}</div><div className="shop-copy"><h3>{name}</h3><p>{content} {content !== "پوسته" && "سکه"}</p><footer><span className="price">{price} ◈</span><button className="primary-button" onClick={() => toast("خرید آزمایشی ثبت شد", { description: "اتصال پرداخت در نسخهٔ انتشار فعال می‌شود." })}><ShoppingBag size={13} /> خرید</button></footer></div></article>)}</section></AppShell>; }

export function Friends() { const [challenged, setChallenged] = useState<string[]>([]); return <AppShell title="دوستان" eyebrow="میزهای مشترک"><div className="section-title-row" style={{ marginTop: 0 }}><div><h2>دوستان آنلاین</h2><p>آن‌ها را به یک بازی دوستانه دعوت کن.</p></div><button className="primary-button" onClick={() => toast("کد اتاق: ARENA-7Q4P", { description: "کد را برای دوستانت بفرست." })}>ساخت اتاق</button></div><section className="premium-panel friends-list">{[["کیان.آ","Gold I"],["پارسا","Silver III"],["نیکی.ف","Platinum I"],["سامان","Gold II"]].map(([name, rank]) => <div className="friend-row" key={name}><span className="list-avatar">{name[0]}</span><span className="friend-meta"><b>{name}</b><small><i className="online-dot" /> آنلاین · {rank}</small></span><span className="friend-actions"><button onClick={() => { setChallenged([...challenged, name]); toast(challenged.includes(name) ? "دعوت قبلاً ارسال شده" : `دعوت بازی برای ${name} ارسال شد`); }}>{challenged.includes(name) ? "ارسال شد" : "چالش"}</button><button onClick={() => toast("پروفایل دوست باز شد")}>پروفایل</button></span></div>)}</section><div className="section-title-row"><div><h2>درخواست‌های دوستی</h2><p>دو بازیکن منتظر پاسخ تو هستند.</p></div></div><section className="content-grid"><article className="premium-panel mini-card"><div className="card-icon"><Users size={18} /></div><h3>باران.م</h3><p>سطح ۲۱ · Silver II · ۵ دوست مشترک</p><footer><button className="primary-button" onClick={() => toast("درخواست پذیرفته شد")}>پذیرش</button><button className="surface-button" onClick={() => toast("درخواست رد شد")}>رد</button></footer></article></section></AppShell>; }

export function Tournaments() { const [joined, setJoined] = useState<string[]>([]); const events = [["Weekend Championship","۱۰,۰۰۰ سکه","۲ ساعت و ۱۸ دقیقه"],["Gold Rush","۵,۰۰۰ سکه","فردا، ساعت ۱۸"],["Royal Knockout","۲۰۰ الماس","سه‌شنبه، ساعت ۲۱"]]; return <AppShell title="مسابقات" eyebrow="صحنهٔ قهرمانی"><div className="section-title-row" style={{ marginTop: 0 }}><div><h2>میزهای مسابقهٔ فعال</h2><p>جای خودت را رزرو کن و برای جایزه رقابت کن.</p></div><span className="status-badge active">۳ مسابقه فعال</span></div><section className="content-grid">{events.map(([name, prize, time]) => <article className="premium-panel tournament-card" key={name}><span className="status-badge warm">ثبت‌نام باز</span><h3>{name}</h3><p>۱۶ بازیکن · ورودی ۱۲۰ سکه</p><div className="tournament-prize"><span>جایزهٔ اصلی<br />{time}</span><b>{prize}</b></div><button className={joined.includes(name) ? "surface-button" : "primary-button"} style={{ width: "100%" }} onClick={() => { setJoined([...joined, name]); toast(joined.includes(name) ? "ثبت‌نام تو انجام شده" : "به لیست مسابقه اضافه شد", { description: name }); }}>{joined.includes(name) ? "ثبت‌نام شد" : "شرکت در مسابقه"}</button></article>)}</section></AppShell>; }

export function Promo() { const [code, setCode] = useState(""); const [result, setResult] = useState<"" | "success" | "invalid">(""); const activate = () => { const ok = code.replace(/\s/g, "").toUpperCase() === "ARENA-2026"; setResult(ok ? "success" : "invalid"); toast(ok ? "کد با موفقیت فعال شد!" : "کد واردشده معتبر نیست.", { description: ok ? "+500 سکه به کیف شما اضافه شد" : "فرمت کد را بررسی کنید." }); }; return <AppShell title="کد جایزه" eyebrow="فعال‌سازی پاداش"><section className="promo-layout"><article className="premium-panel promo-card"><div className="broadcast-band"><span>PROMO TERMINAL</span><i /><small className="mono">REWARD // 500</small></div><span className="status-badge warm">کد رویداد</span><h2>یک کد، یک پاداش تازه</h2><p>کد جایزه خود را وارد کن و پاداش مربوط به رویداد را بی‌درنگ دریافت کن. برای آزمایش، از <b className="mono">ARENA-2026</b> استفاده کن.</p><div className="promo-input-row"><input value={code} onChange={e => { setCode(e.target.value); setResult(""); }} placeholder="XXXX-XXXX-XXXX" /><button className="primary-button" onClick={activate}>فعال‌سازی کد</button></div>{result && <div className={`promo-result ${result === "invalid" ? "invalid" : ""}`}>{result === "success" ? <Check size={15} /> : <CircleHelp size={15} />}{result === "success" ? "کد با موفقیت فعال شد؛ +500 سکه" : "کد واردشده معتبر نیست."}</div>}</article><aside className="premium-panel promo-history"><h3>کدهای دریافت‌شده</h3><div className="promo-ledger-title"><span>کد</span><span>وضعیت</span></div><div className="history-pill"><b>SPRING-ARENA</b><small>+250 ◒</small></div><div className="history-pill"><b>WELCOME-LUDO</b><small>آواتار</small></div><div className="history-pill"><b>GOLD-2026</b><small>+1 ◈</small></div></aside></section></AppShell>; }

export function Profile() { return <AppShell title="پروفایل" eyebrow="کارنامهٔ بازیکن"><section className="premium-panel profile-hero"><div className="profile-avatar-big">آ</div><div><h2>آرین.م</h2><p>بازیکن منچ رقابتی از تهران · عضو از مرداد ۱۴۰۵</p><div className="profile-tags"><span>سطح 28</span><span>Gold II</span><span>60% Win Rate</span></div></div><div className="profile-score"><b>2,480</b><small>امتیاز لیگ</small></div></section><section className="stats-season-grid" style={{ marginTop: 15 }}><article className="premium-panel stat-panel"><header><div className="panel-label">آمار کلی<b>کارنامهٔ Arena</b></div><Award size={20} color="#f2a348" /></header><div className="stat-grid"><div className="stat-item"><span>بازی</span><b>186</b></div><div className="stat-item"><span>برد</span><b>112</b></div><div className="stat-item"><span>باخت</span><b>74</b></div><div className="stat-item"><span>برد متوالی</span><b>5</b></div></div></article><article className="premium-panel activity-card"><h3>دستاورد بعدی</h3><div className="activity-row"><span className="activity-dot" /><div><b>Speed Winner</b><small>دو برد زیر ۱۰ دقیقه · 1 / 2</small></div></div><div className="progress-track"><span style={{ width: "50%" }} /></div></article></section><div className="section-title-row"><div><h2>تاریخچهٔ بازی</h2><p>آخرین میزهای رقابتی تو.</p></div><button className="text-link" onClick={() => toast("فیلتر تاریخچه به‌زودی فعال می‌شود")}>فیلتر</button></div><section className="premium-panel match-history">{[["امروز، ۱۴:۲۸","کیان.آ","برد","+28"],["دیروز، ۲۲:۱۱","سارا.م","باخت","-16"],["دیروز، ۱۸:۴۰","پارسا","برد","+24"],["۲ روز پیش","نیما.ک","برد","+31"]].map(([date, opponent, result, score]) => <div className="match-row" key={`${date}-${opponent}`}><small>{date}</small><span className="player-name"><i className="list-avatar">{opponent[0]}</i><b>{opponent}</b></span><b className={result === "برد" ? "result-win" : "result-loss"}>{result}</b><span className="mono">{score}</span></div>)}</section></AppShell>; }

export function SettingsPage() { const [sound, setSound] = useState(true); const [alerts, setAlerts] = useState(true); const [, navigate] = useLocation(); return <AppShell title="تنظیمات" eyebrow="کنترل تجربه"><div className="section-title-row" style={{ marginTop: 0 }}><div><h2>تنظیم تجربهٔ بازی</h2><p>گزینه‌ها روی همین دستگاه ذخیره می‌شوند.</p></div></div><section className="premium-panel setting-list">{[[Volume2,"صدا و لرزش","صدای تاس، حرکت مهره و اعلان‌ها",sound,setSound],[MessageCircle,"اعلان‌ها","دعوت دوست و رویدادهای فصل",alerts,setAlerts]].map(([Icon,title,description,value,setter]) => { const C = Icon as typeof Volume2; const set = setter as (v:boolean)=>void; return <div className="setting-row" key={String(title)}><C size={18}/><span><b>{String(title)}</b><small>{String(description)}</small></span><button className={`switch ${value ? "is-on" : ""}`} aria-label={String(title)} onClick={() => set(!value)}><i /></button></div>; })}<div className="setting-row"><Shield size={18}/><span><b>حریم خصوصی</b><small>نمایش تاریخچه و وضعیت آنلاین</small></span><button className="surface-button" onClick={() => toast("تنظیمات حریم خصوصی باز شد")}>مدیریت</button></div><div className="setting-row"><Sparkles size={18}/><span><b>ظاهر</b><small>تم تیرهٔ Arena After Dark فعال است</small></span><button className="surface-button" onClick={() => toast("تم روشن در نسخهٔ بعدی تجربه فعال می‌شود")}>تغییر تم</button></div></section><div className="empty-state" style={{ marginTop: 16 }}><PackageOpen size={28}/><b>تنظیمات بازی در امان است</b><p>وقتی وارد یک میز می‌شوی، هر کنترل ضروری دقیقاً همان‌جا در دسترس باقی می‌ماند.</p><button className="primary-button" onClick={() => navigate("/play")}>بازگشت به بازی</button></div></AppShell>; }
