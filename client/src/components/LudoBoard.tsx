/**
 * Arena After Dark design reminder: board movement must feel like a measured
 * broadcast replay—clear steps, purposeful highlight, and no noisy effects.
 */
import { CSSProperties, useEffect, useRef, useState } from "react";

const starts: Record<string, [number, number]> = {
  red: [6, 1], blue: [1, 8], yellow: [8, 13], green: [13, 6],
};

const redRoute = [
  { row: 2, col: 2 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 },
  { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 5, col: 6 }, { row: 4, col: 6 },
  { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
  { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 1, col: 8 }, { row: 2, col: 8 },
  { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 }, { row: 6, col: 9 },
  { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 },
  { row: 6, col: 14 }, { row: 7, col: 14 }, { row: 8, col: 14 }, { row: 8, col: 13 },
  { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
  { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 },
  { row: 13, col: 8 }, { row: 14, col: 8 }, { row: 14, col: 7 }, { row: 14, col: 6 },
];

type BoardProps = {
  compact?: boolean;
  moveValue?: number;
  onMoveComplete?: (move: { steps: number; fromStep: number; toStep: number }) => void;
};

function cellTone(row: number, column: number) {
  const inHome = (r: number, c: number) => row >= r && row < r + 6 && column >= c && column < c + 6;
  if (inHome(0, 0)) return "home red-home";
  if (inHome(0, 9)) return "home blue-home";
  if (inHome(9, 9)) return "home yellow-home";
  if (inHome(9, 0)) return "home green-home";
  if (row >= 6 && row <= 8 && column >= 6 && column <= 8) {
    return "finish";
  }
  if (row >= 6 && row <= 8 || column >= 6 && column <= 8) {
    const start = Object.entries(starts).find(([, point]) => point[0] === row && point[1] === column)?.[0];
    return `track ${start ? `start ${start}` : ""}`;
  }
  return "empty";
}

const staticTokens = [
  { id: "red-2", color: "red", row: 4, col: 4 }, { id: "blue-1", color: "blue", row: 2, col: 11 },
  { id: "blue-2", color: "blue", row: 4, col: 13 }, { id: "yellow-1", color: "yellow", row: 11, col: 11 },
  { id: "yellow-2", color: "yellow", row: 13, col: 13 }, { id: "green-1", color: "green", row: 11, col: 2 },
  { id: "green-2", color: "green", row: 13, col: 4 },
];

export function LudoBoard({ compact = false, moveValue = 0, onMoveComplete }: BoardProps) {
  const [selected, setSelected] = useState("red-1");
  const [redProgress, setRedProgress] = useState(0);
  const [moving, setMoving] = useState(false);
  const [hopping, setHopping] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const movedCells = new Set(redRoute.slice(1, redProgress + 1).map((point) => `${point.row}-${point.col}`));
  const redPosition = redRoute[redProgress];
  const tokens = [{ id: "red-1", color: "red", ...redPosition }, ...staticTokens];

  const handleTokenClick = (tokenId: string) => {
    setSelected(tokenId);
    if (!moveValue || moving || tokenId !== "red-1") return;
    const fromStep = redProgress;
    const steps = Math.min(moveValue, redRoute.length - redProgress - 1);
    if (!steps) return;

    setMoving(true);
    let completed = 0;
    timerRef.current = window.setInterval(() => {
      completed += 1;
      setHopping("red-1");
      setRedProgress((current) => Math.min(current + 1, redRoute.length - 1));
      window.setTimeout(() => setHopping(""), 112);
      if (completed >= steps && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
        window.setTimeout(() => {
          setMoving(false);
          onMoveComplete?.({ steps, fromStep, toStep: fromStep + steps });
        }, 170);
      }
    }, 155);
  };

  return (
    <div className={`ludo-board-wrap ${compact ? "is-compact" : ""}`}>
      <div className={`ludo-board ${moving ? "is-moving" : ""} ${moveValue ? "is-awaiting-move" : ""}`} aria-label="صفحهٔ بازی منچ">
        {Array.from({ length: 225 }).map((_, index) => {
          const row = Math.floor(index / 15);
          const column = index % 15;
          const moved = movedCells.has(`${row}-${column}`);
          return <span key={`${row}-${column}`} className={`ludo-cell ${cellTone(row, column)} ${moved ? "is-travelled" : ""}`} />;
        })}
        {tokens.map((token) => (
          <button
            key={token.id}
            aria-label={`مهرهٔ ${token.color}`}
            className={`ludo-token ${token.color} ${selected === token.id ? "is-selected" : ""} ${hopping === token.id ? "is-hopping" : ""}`}
            style={{ gridRow: token.row + 1, gridColumn: token.col + 1 } as CSSProperties}
            onClick={() => handleTokenClick(token.id)}
            disabled={moving}
          />
        ))}
        <div className="board-center-mark" aria-hidden="true"><span>◆</span></div>
        {!compact && moveValue > 0 && <div className="board-move-prompt">{moving ? "مهره در حال حرکت است" : `${moveValue} خانه حرکت کن؛ مهرهٔ طلایی را انتخاب کن`}</div>}
      </div>
    </div>
  );
}
