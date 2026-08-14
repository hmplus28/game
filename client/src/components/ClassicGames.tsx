/**
 * Classic Games mobile reminder: simple rules, large targets, and one clear
 * action per turn make the experience approachable for first-time players.
 */
import { Bot, ChevronLeft, CircleHelp, Crown, Dices, Gamepad2, RotateCcw, Trophy, UsersRound, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";

type GameKind = "ludo" | "snakes";
type PlayMode = "lobby" | "practice" | "online" | "online-play";
type Turn = "you" | "bot";
type OnlineRoomState = { status: string; players: { id: string; nickname: string; color: string; connected: boolean }[]; state: { active_player?: string; positions?: Record<string, number>; last_dice?: number } };

const snakes = { 17: 7, 54: 34, 62: 19, 98: 79 } as Record<number, number>;
const ladders = { 4: 14, 9: 31, 20: 38, 28: 84, 51: 67, 71: 91 } as Record<number, number>;
const ludoRoute = Array.from({ length: 24 }, (_, index) => index);
const dicePips: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

function routeCell(index: number) {
  if (index <= 6) return { row: 1, column: index + 1 };
  if (index <= 11) return { row: index - 5, column: 7 };
  if (index <= 18) return { row: 7, column: 19 - index };
  return { row: 25 - index, column: 1 };
}

function ClassicLudoBoard({ you, bot }: { you: number | null; bot: number | null }) {
  const youCell = you === null ? null : routeCell(you);
  const botCell = bot === null ? null : routeCell((bot + 12) % ludoRoute.length);
  return <div className="classic-ludo-board" aria-label="صفحهٔ منچ کلاسیک">
    {ludoRoute.map((cell) => { const point = routeCell(cell); return <i key={cell} className={`classic-ludo-cell ${cell === 0 ? "is-start-you" : cell === 12 ? "is-start-bot" : ""}`} style={{ gridRow: point.row, gridColumn: point.column }} />; })}
    <div className="classic-ludo-home your-home"><span>شما</span></div><div className="classic-ludo-home bot-home"><span>ربات</span></div><div className="classic-ludo-finish"><Crown size={20} /></div>
    {youCell && <span className="classic-token you-token" style={{ gridRow: youCell.row, gridColumn: youCell.column }}>آ</span>}
    {botCell && <span className="classic-token bot-token" style={{ gridRow: botCell.row, gridColumn: botCell.column }}>ر</span>}
    {!youCell && <span className="classic-token you-token home-token">آ</span>}{!botCell && <span className="classic-token bot-token bot-home-token">ر</span>}
  </div>;
}

function SnakesBoard({ you, bot }: { you: number; bot: number }) {
  return <div className="snakes-board" aria-label="صفحهٔ مار و پله">
    {Array.from({ length: 100 }, (_, index) => { const number = 100 - index; const special = ladders[number] ? "ladder" : snakes[number] ? "snake" : ""; return <div className={`snake-cell ${special}`} key={number}><span>{number}</span>{ladders[number] && <b>↗</b>}{snakes[number] && <b>↘</b>}{you === number && <i className="snake-token you-token">آ</i>}{bot === number && <i className="snake-token bot-token">ر</i>}</div>; })}
  </div>;
}

export function ClassicGames() {
  const [kind, setKind] = useState<GameKind>("ludo");
  const [mode, setMode] = useState<PlayMode>("lobby");
  const [turn, setTurn] = useState<Turn>("you");
  const [dice, setDice] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [ludoPositions, setLudoPositions] = useState<{ you: number | null; bot: number | null }>({ you: null, bot: null });
  const [snakePositions, setSnakePositions] = useState({ you: 0, bot: 0 });
  const [roomCode, setRoomCode] = useState("");
  const [onlineRoom, setOnlineRoom] = useState("");
  const [onlineState, setOnlineState] = useState<OnlineRoomState | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<"idle" | "connecting" | "waiting" | "ready" | "error">("idle");
  const [playerId] = useState(() => `player-${Math.random().toString(36).slice(2, 10)}`);
  const socketRef = useRef<WebSocket | null>(null);
  const isOnline = mode === "online-play";

  useEffect(() => () => socketRef.current?.close(), []);

  const resetGame = () => {
    setTurn("you"); setDice(1); setLudoPositions({ you: null, bot: null }); setSnakePositions({ you: 0, bot: 0 });
  };
  const moveSnakes = (who: Turn, value: number) => {
    setSnakePositions((previous) => {
      const current = previous[who]; const raw = current + value;
      if (raw > 100) return previous;
      const target = ladders[raw] ?? snakes[raw] ?? raw;
      if (target !== raw) toast(ladders[raw] ? "پله!" : "مار!", { description: ladders[raw] ? `به خانهٔ ${target} رفتی.` : `به خانهٔ ${target} برگشتی.` });
      if (target === 100) toast(who === "you" ? "بردی!" : "ربات برنده شد", { description: "برای یک راند تازه، بازی را دوباره شروع کن." });
      return { ...previous, [who]: target };
    });
  };
  const moveLudo = (who: Turn, value: number) => {
    setLudoPositions((previous) => {
      const current = previous[who];
      if (current === null && value !== 6) { toast(who === "you" ? "برای ورود باید ۶ بیاوری" : "ربات هم منتظر ۶ است"); return previous; }
      const target = current === null ? 0 : current + value;
      if (target >= ludoRoute.length) { toast(who === "you" ? "تو برنده شدی!" : "ربات برنده شد", { description: "مسیر را کامل کرد." }); return { ...previous, [who]: ludoRoute.length - 1 }; }
      return { ...previous, [who]: target };
    });
  };
  const botTurn = () => {
    setTurn("bot");
    window.setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1; setDice(value);
      if (kind === "ludo") moveLudo("bot", value); else moveSnakes("bot", value);
      window.setTimeout(() => setTurn("you"), 700);
    }, 800);
  };
  const roll = () => {
    if (rolling || turn !== "you") return;
    if (isOnline) {
      if (socketRef.current?.readyState !== WebSocket.OPEN) return toast("اتصال آنلاین آماده نیست");
      setRolling(true);
      socketRef.current.send(JSON.stringify({ action: "roll" }));
      return;
    }
    setRolling(true); let frames = 0;
    const reel = window.setInterval(() => { setDice(Math.floor(Math.random() * 6) + 1); frames += 1; if (frames === 8) { window.clearInterval(reel); const value = Math.floor(Math.random() * 6) + 1; setDice(value); setRolling(false); if (kind === "ludo") moveLudo("you", value); else moveSnakes("you", value); botTurn(); } }, 75);
  };
  const enterPractice = (next: GameKind) => { setKind(next); setMode("practice"); resetGame(); };
  const applyOnlineState = (nextState: OnlineRoomState) => {
    setOnlineState(nextState);
    setOnlineStatus(nextState.status === "active" ? "ready" : "waiting");
    setTurn(nextState.state.active_player === playerId ? "you" : "bot");
    const positions = nextState.state.positions ?? {};
    const opponent = Object.entries(positions).find(([id]) => id !== playerId)?.[1] ?? 0;
    if (kind === "snakes") setSnakePositions({ you: positions[playerId] ?? 0, bot: opponent });
    else setLudoPositions({ you: positions[playerId] ?? null, bot: opponent || null });
  };
  const connectRoom = (code: string) => {
    const base = (import.meta.env.VITE_DJANGO_WS_URL ?? "").replace(/\/$/, "");
    if (!base) { setOnlineStatus("error"); return toast("سرور آنلاین تنظیم نشده", { description: "برای بازی واقعی، VITE_DJANGO_WS_URL را روی آدرس سرویس Django تنظیم کن." }); }
    socketRef.current?.close(); setOnlineStatus("connecting"); setOnlineRoom(code);
    const socket = new WebSocket(`${base}/ws/rooms/${code}/`); socketRef.current = socket;
    socket.onopen = () => socket.send(JSON.stringify({ action: "join", player_id: playerId, nickname: "آرین", game_type: kind }));
    socket.onerror = () => { setOnlineStatus("error"); toast("اتصال اتاق برقرار نشد", { description: "آدرس سرور و اتصال اینترنت را بررسی کن." }); };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "joined" && !message.ok) toast(message.message);
      if (message.type === "room_state") applyOnlineState(message);
      if (message.type === "roll") {
        setRolling(false);
        if (!message.ok) return toast(message.message);
        setDice(message.dice_value);
        window.setTimeout(() => {
          const fromStep = kind === "snakes" ? snakePositions.you : ludoPositions.you ?? 0;
          socket.send(JSON.stringify({ action: "move", token_id: playerId, from_step: fromStep, to_step: fromStep + message.dice_value }));
        }, 330);
      }
      if (message.type === "error") toast(message.message);
    };
  };
  const createRoom = () => { const code = roomCode.trim().toUpperCase() || `PLAY-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; connectRoom(code); };

  if (mode === "lobby") return <section className="classic-lobby">
    <div className="classic-control-surface"><div className="classic-brand-row"><BrandMark /><span><i /> CLASSIC MATCHROOM</span></div><div className="classic-intro"><span className="classic-live"><i /> میزها بازند</span><h2>میزت را انتخاب کن.</h2><p>قواعد آشنا، نوبت کوتاه، شروع بی‌وقفه.</p></div><div className="classic-control-rail"><span>MODE // 02</span><i /><b>بازی کلاسیک</b><em>یک تصمیم تا شروع</em></div></div>
    <article className="classic-choice ludo-choice"><div><span className="choice-label">CLASSIC LUDO</span><h3>منچ معمولی</h3><p>با تاس ۶ وارد مسیر شو؛ زودتر به پایان برس.</p><span className="choice-hud"><i /> ۲ بازیکن · میز سریع</span></div><button className="primary-button" onClick={() => enterPractice("ludo")}><Bot size={16} /> شروع تمرین</button></article>
    <article className="classic-choice snakes-choice"><div><span className="choice-label">SNAKES & LADDERS</span><h3>مار و پله</h3><p>پله‌ها بالا می‌برند؛ از مارها جا نمان.</p><span className="choice-hud"><i /> مسیر ۱۰۰ خانه‌ای</span></div><button className="primary-button" onClick={() => enterPractice("snakes")}><Gamepad2 size={16} /> مسابقه را شروع کن</button></article>
    <article className="online-entry"><div><span className="online-emblem"><Wifi size={18} /></span><div><b>بازی آنلاین با دوست</b><small>اتاق خصوصی بساز یا با کد وارد شو.</small></div></div><button className="surface-button" onClick={() => setMode("online")}>اتاق آنلاین <ChevronLeft size={15} /></button></article>
    <div className="classic-rule"><CircleHelp size={16} /><p>برای منچ باید ۶ بیاوری تا مهره وارد مسیر شود. در مار و پله، هر نوبت فقط یک حرکت داری.</p></div>
  </section>;

  if (mode === "online") return <section className="online-room-page"><button className="back-link" onClick={() => setMode("lobby")}>بازگشت <ChevronLeft size={15} /></button><div className="classic-intro"><span className="classic-live"><i /> اتاق خصوصی</span><h2>دوستت را دعوت کن.</h2><p>کد اتاق را بساز یا کدی را که دریافت کرده‌ای وارد کن.</p></div><div className="game-kind-switch"><button className={kind === "ludo" ? "is-active" : ""} onClick={() => setKind("ludo")}>منچ</button><button className={kind === "snakes" ? "is-active" : ""} onClick={() => setKind("snakes")}>مار و پله</button></div><label className="room-input"><span>کد اتاق</span><input value={roomCode} onChange={(event) => setRoomCode(event.target.value)} placeholder="مثلاً PLAY-A7K2" /></label><button className="primary-button room-submit" onClick={createRoom}><UsersRound size={17} /> ساخت یا ورود به اتاق</button>{onlineRoom && <div className={`room-ready ${onlineStatus === "ready" ? "is-ready" : ""}`}><span><Wifi size={17} /></span><div><b>اتاق {onlineRoom} {onlineStatus === "ready" ? "آمادهٔ بازی است" : "ثبت شد"}</b><small>{onlineStatus === "connecting" ? "در حال اتصال به میزبان…" : onlineStatus === "ready" ? "یک بازیکن دیگر متصل شد." : "منتظر ورود یک بازیکن دیگر هستیم."}</small></div></div>}{onlineStatus === "ready" && <button className="primary-button room-submit" onClick={() => { resetGame(); setMode("online-play"); }}>شروع بازی آنلاین</button>}<div className="online-note"><Trophy size={16} /> برای مسابقهٔ واقعی، هر دو بازیکن باید به همین کد اتاق وارد شوند.</div></section>;

  const title = kind === "ludo" ? "منچ معمولی" : "مار و پله";
  return <section className="classic-play"><div className="classic-play-top"><button className="back-link" onClick={() => setMode(isOnline ? "online" : "lobby")}>بازی‌ها <ChevronLeft size={15} /></button><span className="practice-badge">{isOnline ? <><Wifi size={13} /> اتاق {onlineRoom}</> : <><Bot size={13} /> تمرین با ربات</>}</span></div><header className="classic-match-head"><span>{turn === "you" ? "نوبت تو" : isOnline ? "نوبت حریف" : "نوبت ربات"}</span><h2>{title}</h2><small>{kind === "ludo" ? "با ۶ وارد مسیر شو" : "به خانهٔ ۱۰۰ برس"}</small></header>{kind === "ludo" ? <ClassicLudoBoard you={ludoPositions.you} bot={ludoPositions.bot} /> : <SnakesBoard you={snakePositions.you} bot={snakePositions.bot} />}<div className="classic-score"><span><b>{kind === "ludo" ? ludoPositions.you === null ? 0 : ludoPositions.you + 1 : snakePositions.you}</b> شما</span><i /><span><b>{kind === "ludo" ? ludoPositions.bot === null ? 0 : ludoPositions.bot + 1 : snakePositions.bot}</b> {isOnline ? onlineState?.players.find((player) => player.id !== playerId)?.nickname ?? "حریف" : "ربات"}</span></div><div className="classic-dice-zone"><div className={`classic-dice ${rolling ? "is-rolling" : ""}`}>{Array.from({ length: 9 }, (_, index) => <i key={index} className={dicePips[dice].includes(index) ? "" : "blank"} />)}</div><button className="primary-button classic-roll" disabled={rolling || turn !== "you"} onClick={roll}><Dices size={18} /> {rolling ? "در حال چرخش" : turn === "bot" ? isOnline ? "نوبت حریف" : "ربات در حال بازی" : "تاس بریز"}</button><button className="surface-button" onClick={resetGame}><RotateCcw size={15} /> شروع دوباره</button></div></section>;
}
