"""Authoritative, variation-free rules for the classic 1–100 Snake & Ladders board."""

LADDERS = {2: 23, 8: 34, 20: 77, 32: 68, 41: 79, 74: 92}
SNAKES = {99: 9, 95: 75, 88: 24, 62: 19, 48: 26, 36: 6}
FINISH = 100


def advance(position: int, dice_value: int) -> dict:
    """Advance exactly one turn; an exact roll is required to finish."""
    if position < 0 or position > FINISH or not 1 <= dice_value <= 6:
        raise ValueError("invalid position or dice value")
    landing = position + dice_value
    if landing > FINISH:
        return {"from": position, "to": position, "event": "blocked", "winner": False}
    if landing in LADDERS:
        return {"from": position, "to": LADDERS[landing], "landing": landing, "event": "ladder", "winner": LADDERS[landing] == FINISH}
    if landing in SNAKES:
        return {"from": position, "to": SNAKES[landing], "landing": landing, "event": "snake", "winner": False}
    return {"from": position, "to": landing, "event": "move", "winner": landing == FINISH}


def resolve_capture(positions: dict[str, int], attacker_id: str, landing: int) -> dict:
    """Send a rival back to start when an attacker finishes on its non-start square."""
    updated = {str(player_id): int(position) for player_id, position in positions.items()}
    captured_id = next((player_id for player_id, position in updated.items() if player_id != attacker_id and landing > 0 and position == landing), None)
    if captured_id:
        updated[captured_id] = 0
    return {"positions": updated, "captured": captured_id}
