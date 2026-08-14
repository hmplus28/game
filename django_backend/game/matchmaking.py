"""WebSocket matchmaking queue for creating random Snake & Ladders rooms."""
import secrets

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.db import transaction

from .models import GameRoom, MatchQueueEntry, RoomPlayer


class MatchmakingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send_json({"type": "connected"})

    async def disconnect(self, _close_code):
        if hasattr(self, "player_id"):
            await self._remove_from_queue(self.player_id)
            await self.channel_layer.group_discard(f"match_{self.player_id}", self.channel_name)

    async def receive_json(self, content, **_kwargs):
        action = content.get("action")
        if action == "queue":
            self.player_id = str(content.get("player_id", ""))[:48]
            nickname = str(content.get("nickname", "بازیکن"))[:32]
            if not self.player_id:
                return await self.send_json({"type": "error", "message": "شناسهٔ بازیکن معتبر نیست."})
            await self.channel_layer.group_add(f"match_{self.player_id}", self.channel_name)
            match = await self._queue_or_match(self.player_id, nickname)
            if not match:
                return await self.send_json({"type": "queued", "message": "در حال پیدا کردن حریف…"})
            await self.send_json({"type": "match_found", **match})
            await self.channel_layer.group_send(f"match_{match['opponent_id']}", {"type": "match.found", "room_code": match["room_code"], "opponent": nickname})
        elif action == "cancel" and hasattr(self, "player_id"):
            await self._remove_from_queue(self.player_id)
            await self.send_json({"type": "cancelled"})

    async def match_found(self, event):
        await self.send_json({"type": "match_found", "room_code": event["room_code"], "opponent": event["opponent"]})

    @database_sync_to_async
    def _queue_or_match(self, player_id, nickname):
        with transaction.atomic():
            existing = MatchQueueEntry.objects.select_for_update().filter(player_id=player_id).first()
            candidate = MatchQueueEntry.objects.select_for_update().exclude(player_id=player_id).first()
            if not candidate:
                if existing:
                    existing.nickname = nickname
                    existing.save(update_fields=["nickname"])
                else:
                    MatchQueueEntry.objects.create(player_id=player_id, nickname=nickname)
                return None
            if existing:
                existing.delete()
            candidate.delete()
            code = self._room_code()
            room = GameRoom.objects.create(code=code, status=GameRoom.Status.ACTIVE, state={"active_player": candidate.player_id, "last_dice": None, "positions": {}, "winner": None})
            RoomPlayer.objects.create(room=room, player_id=candidate.player_id, nickname=candidate.nickname, color="red")
            RoomPlayer.objects.create(room=room, player_id=player_id, nickname=nickname, color="blue")
            return {"room_code": room.code, "opponent_id": candidate.player_id, "opponent": candidate.nickname}

    @staticmethod
    def _room_code():
        while True:
            code = f"MATCH-{secrets.token_urlsafe(4).upper()[:6]}"
            if not GameRoom.objects.filter(code=code).exists():
                return code

    @database_sync_to_async
    def _remove_from_queue(self, player_id):
        MatchQueueEntry.objects.filter(player_id=player_id).delete()
