"""Small, explicit JSON endpoints for deterministic game-state integration."""
import json
import random

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import GameMove, GameRoom


def _payload(request: HttpRequest) -> dict:
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}


def _bad_request(message: str) -> JsonResponse:
    return JsonResponse({"ok": False, "error": message}, status=400)


@require_GET
def health(_request: HttpRequest) -> JsonResponse:
    return JsonResponse({"ok": True, "service": "ludo-arena-django", "version": "1.0"})


@csrf_exempt
@require_POST
def roll_dice(request: HttpRequest) -> JsonResponse:
    payload = _payload(request)
    room_code = str(payload.get("room_code", "ARENA-DEMO")).strip().upper()
    if not room_code or len(room_code) > 24:
        return _bad_request("room_code is required and must be at most 24 characters")
    room, _ = GameRoom.objects.get_or_create(code=room_code, defaults={"status": GameRoom.Status.ACTIVE})
    dice_value = random.SystemRandom().randint(1, 6)
    return JsonResponse({"ok": True, "room_code": room.code, "dice_value": dice_value, "active_color": room.active_color, "turn_number": room.turn_number})


@csrf_exempt
@require_POST
def record_move(request: HttpRequest) -> JsonResponse:
    payload = _payload(request)
    try:
        room_code = str(payload["room_code"]).strip().upper()
        token_id = str(payload["token_id"]).strip()
        dice_value = int(payload["dice_value"])
        from_step = int(payload["from_step"])
        to_step = int(payload["to_step"])
    except (KeyError, TypeError, ValueError):
        return _bad_request("room_code, token_id, dice_value, from_step and to_step are required")
    if not room_code or not token_id:
        return _bad_request("room_code and token_id cannot be empty")
    if not 1 <= dice_value <= 6:
        return _bad_request("dice_value must be between 1 and 6")
    if from_step < 0 or to_step < 0 or to_step - from_step != dice_value:
        return _bad_request("to_step must equal from_step plus dice_value")

    room, _ = GameRoom.objects.get_or_create(code=room_code, defaults={"status": GameRoom.Status.ACTIVE})
    move = GameMove.objects.create(room=room, token_id=token_id, dice_value=dice_value, from_step=from_step, to_step=to_step)
    room.turn_number += 1
    room.active_color = {"red": "blue", "blue": "yellow", "yellow": "green", "green": "red"}.get(room.active_color, "red")
    room.status = GameRoom.Status.ACTIVE
    room.save(update_fields=["turn_number", "active_color", "status", "updated_at"])
    return JsonResponse({"ok": True, "move_id": move.id, "next_color": room.active_color, "turn_number": room.turn_number})


@require_GET
def room_state(_request: HttpRequest, room_code: str) -> JsonResponse:
    room = GameRoom.objects.filter(code=room_code.upper()).first()
    if not room:
        return JsonResponse({"ok": False, "error": "room not found"}, status=404)
    moves = [{"token_id": move.token_id, "dice_value": move.dice_value, "from_step": move.from_step, "to_step": move.to_step, "created_at": move.created_at.isoformat()} for move in room.moves.all()[:12]]
    return JsonResponse({"ok": True, "room": {"code": room.code, "status": room.status, "active_color": room.active_color, "turn_number": room.turn_number, "moves": moves}})
