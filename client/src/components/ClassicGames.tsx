/**
 * Snake & Ladders mobile reminder: clear state, tactile turn controls, and a
 * richly illustrated board make a familiar game immediately approachable.
 */
import { Bot, ChevronLeft, Crown, Dices, RotateCcw, Trophy, UsersRound, Volume2, VolumeX, Wifi } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { playGameSound } from "@/lib/gameSounds";

type Mode = "lobby" | "practice" | "online" | "online-play";
type Player = "you" | "bot";
type Positions = Record<Player, number>;
type OnlineState = { status: string; players: { id: string; nickname: string; connected: boolean }[]; state: { active_player?: string; positions?: Record<string, number>; last_dice?: number } };

const ladders: Record<number, number> = { 2: 23, 8: 34, 20: 77, 32: 68, 41: 79, 74: 92 };
const snakes: Record<number, number> = { 99: 9, 95: 75, 88: 24, 62: 19, 48: 26, 36: 6 };
const pips: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

function squarePosition(square: number) {
  const offset = square - 1;
  const rowFromBottom = Math.floor(offset / 10);
  const columnOffset = offset % 10;
  return { row: 10 - rowFromBottom, column: rowFromBottom % 2 === 0 ? columnOffset + 1 : 10 - columnOffset };
}
function pixel(square: number) {
  const { row, column } = squarePosition(square);
  return { x: (column - 0.5) * 100, y: (row - 0.5) * 100 };
}
function sleep(ms: number) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }

function Ladder({ from, to }: { from: number; to: number }) {
  const start = pixel(from); const end = pixel(to); const dx = end.x - start.x; const dy = end.y - start.y; const length = Math.hypot(dx, dy); const normal = { x: (-dy / length) * 12, y: (dx / length) * 12 };
  return <g className="ladder-art"><line x1={start.x + normal.x} y1={start.y + normal.y} x2={end.x + normal.x} y2={end.y + normal.y} /><line x1={start.x - normal.x} y1={start.y - normal.y} x2={end.x - normal.x} y2={end.y - normal.y} />{Array.from({ length: 5 }, (_, index) => { const t = (index + 1) / 6; const x = start.x + dx * t; const y = start.y + dy * t; return <line key={index} x1={x + normal.x} y1={y + normal.y} x2={x - normal.x} y2={y - normal.y} />; })}</g>;
}
function Snake({ from, to }: { from: number; to: number }) {
  const start = pixel(from); const end = pixel(to); const midX = (start.x + end.x) / 2; const midY = (start.y + end.y) / 2;
  return <g className="snake-art"><path d={`M ${start.x} ${start.y} Q ${midX + 90} ${midY - 70} ${end.x} ${end.y}`} /><circle cx={start.x} cy={start.y} r="20" /></g>;
}

function SnakeBoard({ positions, moving, jump }: { positions: Positions; moving: Player | null; jump: "ladder" | "snake" | null }) {
  const you = squarePosition(Math.max(positions.you, 1)); const bot = squarePosition(Math.max(positions.bot, 1));
  return <div className={`snake-board-stage ${jump ? `is-${jump}` : ""}`}>
    <div className="snake-board" aria-label="صفحهٔ مار و پله">
      {Array.from({ length: 100 }, (_, index) => { const square = index + 1; const position = squarePosition(square); return <div key={square} className={`snake-cell ${ladders[square] ? "is-ladder" : ""} ${snakes[square] ? "is-snake" : ""}`} style={{ gridRow: position.row, gridColumn: position.column }}><span>{square}</span></div>; })}
      <svg className="board-art" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">{Object.entries(ladders).map(([from, to]) => <Ladder key={from} from={Number(from)} to={to} />)}{Object.entries(snakes).map(([from, to]) => <Snake key={from} from={Number(from)} to={to} />)}</svg>
      <span className={`snake-piece you-piece ${moving === "you" ? "is-moving" : ""}`} style={{ gridRow: you.row, gridColumn: you.column } as CSSProperties}>آ</span>
      <span className={`snake-piece bot-piece ${moving === "bot" ? "is-moving" : ""}`} style={{ gridRow: bot.row, gridColumn: bot.column } as CSSProperties}>ر</span>
      <div className="finish-crown"><Crown size={15} /><small>100</small></div>
    </div>
    <div className="board-compass"><i /> خانهٔ تو <span>—</span> خانهٔ ربات <i className="bot" /></div>
  </div>;
}

export function ClassicGames() {
  const [mode, setMode] = useState<Mode>("lobby");
  const [positions, setPositions] = useState<Positions>({ you: 0, bot: 0 });
  const [turn, setTurn] = useState<Player>("you");
  const [dice, setDice] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState<Player | null>(null);
  const [jump, setJump] = useState<"ladder" | "snake" | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [onlineRoom, setOnlineRoom] = useState("");
  const [onlineState, setOnlineState] = useState<OnlineState | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<"idle" | "connecting" | "waiting" | "ready" | "error">("idle");
  const [playerId] = useState(() => `snake-${Math.random().toString(36).slice(2, 10)}`);
  const socketRef = useRef<WebSocket | null>(null);
  const isOnline = mode === "online-play";

  useEffect(() => () => socketRef.current?.close(), []);
  const reset = () => { setPositions({ you: 0, bot: 0 }); setTurn("you"); setDice(1); setWinner(null); setJump(null); setMoving(null); };
  const specialMove = async (player: Player, landed: number) => {
    const type = ladders[landed] ? "ladder" : snakes[landed] ? "snake" : null;
    if (!type) return landed;
    setJump(type); playGameSound(type, soundOn); toast(type === "ladder" ? "پله پیدا کردی!" : "مار به دام انداخت!", { description: type === "ladder" ? `از ${landed} به ${ladders[landed]} صعود کردی.` : `از ${landed} به ${snakes[landed]} برگشتی.` });
    await sleep(520); const destination = type === "ladder" ? ladders[landed] : snakes[landed]; setPositions((current) => ({ ...current, [player]: destination })); await sleep(280); setJump(null); return destination;
  };
  const movePiece = async (player: Player, value: number) => {
    const current = positions[player];
    if (current + value > 100) { playGameSound("blocked", soundOn); toast("برای رسیدن به ۱۰۰ باید تاس دقیق بیاوری"); return false; }
    setMoving(player);
    for (let next = current + 1; next <= current + value; next += 1) { setPositions((state) => ({ ...state, [player]: next })); playGameSound("step", soundOn); await sleep(130); }
    const finalSquare = await specialMove(player, current + value);
    setMoving(null);
    if (finalSquare === 100) { setWinner(player); playGameSound("win", soundOn); toast(player === "you" ? "بردی!" : "ربات برنده شد", { description: player === "you" ? "به خانهٔ ۱۰۰ رسیدی." : "یک راند دیگر امتحان کن." }); return true; }
    return false;
  };
  const botTurn = async () => { setTurn("bot"); await sleep(650); const value = Math.floor(Math.random() * 6) + 1; setDice(value); playGameSound("roll", soundOn); await sleep(350); const won = await movePiece("bot", value); if (!won) setTurn("you"); };
  const practiceRoll = async () => {
    if (rolling || turn !== "you" || winner) return;
    setRolling(true); for (let frame = 0; frame < 8; frame += 1) { setDice(Math.floor(Math.random() * 6) + 1); playGameSound("roll", soundOn); await sleep(72); }
    const value = Math.floor(Math.random() * 6) + 1; setDice(value); setRolling(false); const won = await movePiece("you", value); if (!won) void botTurn();
  };
  const applyRoomState = (state: OnlineState) => { setOnlineState(state); setOnlineStatus(state.status === "active" ? "ready" : "waiting"); setTurn(state.state.active_player === playerId ? "you" : "bot"); const values = state.state.positions ?? {}; const opponent = Object.entries(values).find(([id]) => id !== playerId)?.[1] ?? 0; setPositions({ you: values[playerId] ?? 0, bot: opponent }); };
  const connectRoom = (code: string) => {
    const base = (import.meta.env.VITE_DJANGO_WS_URL ?? "").replace(/\/$/, "");
    if (!base) { setOnlineStatus("error"); return toast("سرور آنلاین تنظیم نشده", { description: "برای بازی واقعی، VITE_DJANGO_WS_URL را تنظیم کن." }); }
    socketRef.current?.close(); setOnlineRoom(code); setOnlineStatus("connecting"); const socket = new WebSocket(`${base}/ws/rooms/${code}/`); socketRef.current = socket;
    socket.onopen = () => socket.send(JSON.stringify({ action: "join", player_id: playerId, nickname: "آرین", game_type: "snakes" }));
    socket.onerror = () => { setOnlineStatus("error"); toast("اتصال آنلاین برقرار نشد"); };
    socket.onmessage = (event) => { const message = JSON.parse(event.data); if (message.type === "room_state") applyRoomState(message); if (message.type === "roll") { setRolling(false); if (message.ok) { setDice(message.dice_value); socket.send(JSON.stringify({ action: "move", token_id: playerId })); } else toast(message.message); } if (message.type === "move" && message.ok) { if (message.event === "ladder") toast("پله پیدا کردی!"); if (message.event === "snake") toast("مار به دام انداخت!"); if (message.event === "blocked") toast("برای ۱۰۰ باید تاس دقیق بیاوری"); if (message.winner) toast("بازیکن برنده شد!"); } if (message.type === "error") toast(message.message); };
  };
  const onlineRoll = () => { if (socketRef.current?.readyState !== WebSocket.OPEN) return toast("اتصال هنوز آماده نیست"); setRolling(true); socketRef.current.send(JSON.stringify({ action: "roll" })); };
  const enterRoom = () => { const code = roomCode.trim().toUpperCase() || `SNAKE-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; connectRoom(code); };

  if (mode === "lobby") return <section className="snake-lobby"><div className="snake-hero"><div className="snake-brand"><BrandMark /><span><i /> SNAKES & LADDERS</span></div><div><small>شبِ بازی</small><h2>تا خانهٔ ۱۰۰ بالا برو.</h2><p>تاس بریز، از پله‌ها صعود کن و پیش از ربات به تاج برس.</p></div><div className="snake-match-ticker"><span><b>100</b> PATH</span><i /><span><b>02</b> PLAYERS</span><i /><span><b>04:00</b> QUICK</span></div><div className="snake-hero-rail"><span>ROUND // 01</span><i /><b>یک مسیر، یک برنده</b></div></div><article className="snake-primary-card"><span className="main-event-label"><i /> MAIN EVENT</span><div className="primary-art"><span>100</span><i>↗</i></div><div><small>تمرین تک‌نفره</small><h3>رویارویی با ربات</h3><p>قواعد کامل مار و پله، نوبت‌های سریع و افکت‌های بازی.</p><button className="primary-button" onClick={() => { reset(); setMode("practice"); }}><Bot size={17} /> شروع مسابقه</button></div></article><article className="snake-online-card"><span className="online-wave"><Wifi size={18} /></span><div><b>اتاق آنلاین</b><small>کد بساز، دوستت را دعوت کن، نوبتی بازی کنید.</small></div><span className="online-mode-code">ROOM // 02</span><button className="surface-button" onClick={() => setMode("online")}>اتاق <ChevronLeft size={15} /></button></article><div className="snake-rules-mini"><span>قانون دقیق</span><p>حرکت فقط تا ۱۰۰ مجاز است؛ پله صعود می‌دهد و سرِ مار بازیکن را پایین می‌آورد.</p></div></section>;

  if (mode === "online") return <section className="snake-online-page"><button className="back-link" onClick={() => setMode("lobby")}>بازی‌ها <ChevronLeft size={15} /></button><div className="snake-page-title"><small>اتاق خصوصی</small><h2>دوستت را وارد بازی کن.</h2><p>یک کد کوتاه بساز یا کد دریافت‌شده را وارد کن.</p></div><label className="snake-room-input"><span>کد اتاق</span><input value={roomCode} onChange={(event) => setRoomCode(event.target.value)} placeholder="مثلاً SNAKE-7P2A" /></label><button className="primary-button snake-room-submit" onClick={enterRoom}><UsersRound size={17} /> ساخت یا ورود به اتاق</button>{onlineRoom && <div className={`snake-room-state ${onlineStatus === "ready" ? "is-ready" : ""}`}><Wifi size={18} /><div><b>{onlineStatus === "ready" ? "حریف متصل شد" : "اتاق ثبت شد"}</b><small>{onlineStatus === "connecting" ? "در حال اتصال…" : onlineStatus === "ready" ? "میز آمادهٔ شروع است." : `کد ${onlineRoom} را ارسال کن.`}</small></div></div>}{onlineStatus === "ready" && <button className="primary-button snake-room-submit" onClick={() => { reset(); setMode("online-play"); }}>شروع بازی آنلاین</button>}</section>;

  return <section className="snake-match"><div className="snake-match-top"><button className="back-link" onClick={() => setMode(isOnline ? "online" : "lobby")}>خروج <ChevronLeft size={15} /></button><button className={`sound-toggle ${soundOn ? "is-on" : ""}`} onClick={() => setSoundOn((enabled) => !enabled)}>{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} {soundOn ? "صدا روشن" : "بی‌صدا"}</button></div><header className="snake-status"><span className={turn === "you" ? "is-active" : ""}>{turn === "you" ? "نوبت توست" : isOnline ? "نوبت حریف" : "ربات در حال حرکت"}</span><h2>مار و پله</h2><small>{winner ? (winner === "you" ? "تاج برای توست" : "تاج به ربات رسید") : "برای رسیدن به ۱۰۰، تاس دقیق بیاور."}</small></header><SnakeBoard positions={positions} moving={moving} jump={jump} /><div className="snake-score"><span><b>{positions.you}</b> خانهٔ تو</span><i /><span><b>{positions.bot}</b> {isOnline ? onlineState?.players.find((player) => player.id !== playerId)?.nickname ?? "حریف" : "ربات"}</span></div><div className="snake-dice-panel"><div className={`snake-dice ${rolling ? "is-rolling" : ""}`}>{Array.from({ length: 9 }, (_, index) => <i key={index} className={pips[dice].includes(index) ? "" : "blank"} />)}</div><div><button className="primary-button snake-roll" onClick={isOnline ? onlineRoll : practiceRoll} disabled={rolling || turn !== "you" || Boolean(winner)}><Dices size={18} /> {rolling ? "تاس در حال چرخش" : turn !== "you" ? "نوبت حریف" : "تاس بریز"}</button><button className="surface-button snake-reset" onClick={reset}><RotateCcw size={15} /> شروع دوباره</button></div></div></section>;
}
