/** Arena After Dark: UI remains instantly responsive; Django is authoritative
 * when VITE_DJANGO_API_URL points to the deployed game API. */
const apiBase = (import.meta.env.VITE_DJANGO_API_URL ?? "").replace(/\/$/, "");

type DiceResponse = { ok: true; dice_value: number; room_code: string };
type MovePayload = { roomCode: string; tokenId: string; diceValue: number; fromStep: number; toStep: number };

async function request<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export const rollDjangoDice = (roomCode: string) => request<DiceResponse>("/api/game/roll/", { room_code: roomCode });

export const recordDjangoMove = (move: MovePayload) => request<{ ok: true }>("/api/game/move/", {
  room_code: move.roomCode,
  token_id: move.tokenId,
  dice_value: move.diceValue,
  from_step: move.fromStep,
  to_step: move.toStep,
});
