/**
 * Mobile Arena design reminder: gameplay is touch-first—eligible pieces are
 * always visually obvious and every move resolves in brief, readable steps.
 */
import { CSSProperties, useEffect, useRef, useState } from "react";

const starts: Record<string, [number, number]> = {
  red: [6, 1], blue: [1, 8], yellow: [8, 13], green: [13, 6],
};

const redRoute = [
  { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
  { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 },
  { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 1, col: 8 }, { row: 2, col: 8 },
  { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 }, { row: 6, col: 9 }, { row: 6, col: 10 },
  { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 }, { row: 6, col: 14 }, { row: 7, col: 14 },
  { row: 8, col: 14 }, { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 },
  { row: 8, col: 9 }, { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 },
  { row: 13, col: 8 }, { row: 14, col: 8 }, { row: 14, col: 7 }, { row: 14, col: 6 },
];

const redHomes = [
  { id: "red-1", row: 2, col: 2 }, { id: "red-2", row: 2, col: 4 },
  { id: "red-3", row: 4, col: 2 }, { id: "red-4", row: 4, col: 4 },
];

const opponentTokens = [
  { id: "blue-1", color: "blue", row: 2, col: 11 }, { id: "blue-2", color: "blue", row: 4, col: 13 },
  { id: "yellow-1", color: "yellow", row: 11, col: 11 }, { id: "yellow-2", color: "yellow", row: 13, col: 13 },
  { id: "green-1", color: "green", row: 11, col: 2 }, { id: "green-2", color: "green", row: 13, col: 4 },
];

type MoveResult = { tokenId: string; steps: number; fromStep: number; toStep: number; entered: boolean };
type BoardProps = { compact?: boolean; moveValue?: number; onMoveComplete?: (move: MoveResult) => void };

function cellTone(row: number, column: number) {
  const inHome = (r: number, c: number) => row >= r && row < r + 6 && column >= c && column < c + 6;
  if (inHome(0, 0)) return "home red-home";
  if (inHome(0, 9)) return "home blue-home";
  if (inHome(9, 9)) return "home yellow-home";
  if (inHome(9, 0)) return "home green-home";
  if (row >= 6 && row <= 8 && column >= 6 && column <= 8) return "finish";
  if (row >= 6 && row <= 8 || column >= 6 && column <= 8) {
    const start = Object.entries(starts).find(([, point]) => point[0] === row && point[1] === column)?.[0];
    return `track ${start ? `start ${start}` : ""}`;
  }
  return "empty";
}

export function LudoBoard({ compact = false, moveValue = 0, onMoveComplete }: BoardProps) {
  const [selected, setSelected] = useState("red-1");
  const [progress, setProgress] = useState<Record<string, number | null>>({ "red-1": null, "red-2": null, "red-3": null, "red-4": null });
  const [moving, setMoving] = useState(false);
  const [hopping, setHopping] = useState("");
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const eligibleIds = redHomes.filter(({ id }) => {
    const position = progress[id];
    return moveValue > 0 && (position === null ? moveValue === 6 : position + moveValue < redRoute.length);
  }).map(({ id }) => id);
  const movedCells = new Set(Object.values(progress).flatMap((position) => position === null ? [] : redRoute.slice(0, position + 1).map((point) => `${point.row}-${point.col}`)));
  const redTokens = redHomes.map((home) => {
    const position = progress[home.id];
    return { id: home.id, color: "red", ...(position === null ? home : redRoute[position]) };
  });
  const tokens = [...redTokens, ...opponentTokens];

  const handleTokenClick = (tokenId: string) => {
    setSelected(tokenId);
    if (!moveValue || moving || !eligibleIds.includes(tokenId)) return;
    const previous = progress[tokenId];
    const fromStep = previous ?? 0;
    const toStep = previous === null ? 0 : previous + moveValue;
    const steps = previous === null ? 1 : moveValue;
    setMoving(true);
    let currentStep = previous === null ? -1 : previous;
    let completed = 0;
    timerRef.current = window.setInterval(() => {
      currentStep += 1;
      completed += 1;
      setHopping(tokenId);
      setProgress((current) => ({ ...current, [tokenId]: currentStep }));
      window.setTimeout(() => setHopping(""), 112);
      if (completed >= steps && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
        window.setTimeout(() => {
          setMoving(false);
          onMoveComplete?.({ tokenId, steps, fromStep, toStep, entered: previous === null });
        }, 170);
      }
    }, 155);
  };

  const prompt = !moveValue ? "برای آغاز نوبت، تاس را پرتاب کن" : !eligibleIds.length ? "حرکت مجاز نیست؛ نوبت را رد کن" : moveValue === 6 ? "یک مهرهٔ درخشان را وارد مسیر کن" : `${moveValue} خانه حرکت کن؛ مهرهٔ درخشان را لمس کن`;
  return (
    <div className={`ludo-board-wrap ${compact ? "is-compact" : ""}`}>
      <div className={`ludo-board ${moving ? "is-moving" : ""} ${moveValue ? "is-awaiting-move" : ""}`} aria-label="صفحهٔ بازی منچ">
        {Array.from({ length: 225 }).map((_, index) => {
          const row = Math.floor(index / 15); const column = index % 15;
          return <span key={`${row}-${column}`} className={`ludo-cell ${cellTone(row, column)} ${movedCells.has(`${row}-${column}`) ? "is-travelled" : ""}`} />;
        })}
        {tokens.map((token) => <button key={token.id} aria-label={`مهرهٔ ${token.color}`} className={`ludo-token ${token.color} ${selected === token.id ? "is-selected" : ""} ${hopping === token.id ? "is-hopping" : ""} ${eligibleIds.includes(token.id) ? "is-eligible" : ""}`} style={{ gridRow: token.row + 1, gridColumn: token.col + 1 } as CSSProperties} onClick={() => handleTokenClick(token.id)} disabled={moving} />)}
        <div className="board-center-mark" aria-hidden="true"><span>◆</span></div>
        {!compact && <div className="board-move-prompt">{moving ? "مهره در حال حرکت است" : prompt}</div>}
      </div>
    </div>
  );
}
