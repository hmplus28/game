"""Room WebSocket consumer for simple, server-broadcast game state."""
import random

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import GameMove, GameRoom, RoomPlayer
from .rules import advance


class RoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"].upper()
        self.group_name = f"room_{self.room_code}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({"type": "connected", "room_code": self.room_code})

    async def disconnect(self, _close_code):
        if hasattr(self, "player_id"):
            await self._set_connected(self.player_id, False)
            await self._broadcast_state()
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **_kwargs):
        action = content.get("action")
        if action == "join":
            self.player_id = str(content.get("player_id", ""))[:48]
            nickname = str(content.get("nickname", "بازیکن"))[:32]
            game_type = content.get("game_type", GameRoom.GameType.SNAKES)
            if not self.player_id or game_type not in GameRoom.GameType.values:
                return await self.send_json({"type": "error", "message": "مشخصات ورود معتبر نیست."})
            joined, message = await self._join_room(self.player_id, nickname, game_type)
            await self.send_json({"type": "joined", "ok": joined, "message": message})
            await self._broadcast_state()
            return
        if not hasattr(self, "player_id"):
            return await self.send_json({"type": "error", "message": "ابتدا وارد اتاق شوید."})
        if action == "roll":
            result = await self._roll(self.player_id)
            await self.send_json(result)
            if result.get("ok"):
                await self._broadcast_state()
            return
        if action == "move":
            result = await self._move(self.player_id, content)
            await self.send_json(result)
            if result.get("ok"):
                await self._broadcast_state()

    async def room_state(self, event):
        await self.send_json({"type": "room_state", **event["state"]})

    async def _broadcast_state(self):
        await self.channel_layer.group_send(self.group_name, {"type": "room.state", "state": await self._state()})

    @database_sync_to_async
    def _join_room(self, player_id, nickname, game_type):
        room, _ = GameRoom.objects.get_or_create(code=self.room_code, defaults={"game_type": game_type})
        if room.game_type != game_type:
            return False, "نوع بازی این اتاق متفاوت است."
        player = RoomPlayer.objects.filter(room=room, player_id=player_id).first()
        if not player and room.players.count() >= room.max_players:
            return False, "اتاق پر است."
        if not player:
            colors = ["red", "blue", "green", "yellow"]
            player = RoomPlayer.objects.create(room=room, player_id=player_id, nickname=nickname, color=colors[room.players.count()])
        else:
            player.nickname = nickname
            player.is_connected = True
            player.save(update_fields=["nickname", "is_connected"])
        if not room.state:
            room.state = {"active_player": player_id, "last_dice": None, "positions": {}, "winner": None}
        if room.players.count() >= 2:
            room.status = GameRoom.Status.ACTIVE
        room.save(update_fields=["state", "status", "updated_at"])
        return True, "وارد اتاق شدی."

    @database_sync_to_async
    def _set_connected(self, player_id, connected):
        RoomPlayer.objects.filter(room__code=self.room_code, player_id=player_id).update(is_connected=connected)

    @database_sync_to_async
    def _state(self):
        room = GameRoom.objects.get(code=self.room_code)
        return {"room_code": room.code, "game_type": room.game_type, "status": room.status, "turn_number": room.turn_number, "state": room.state, "players": [{"id": player.player_id, "nickname": player.nickname, "color": player.color, "connected": player.is_connected} for player in room.players.all().order_by("joined_at")]}

    @database_sync_to_async
    def _roll(self, player_id):
        room = GameRoom.objects.get(code=self.room_code)
        if room.status != GameRoom.Status.ACTIVE or room.state.get("active_player") != player_id:
            return {"type": "roll", "ok": False, "message": "نوبت شما نیست."}
        value = random.SystemRandom().randint(1, 6)
        room.state["last_dice"] = value
        room.save(update_fields=["state", "updated_at"])
        return {"type": "roll", "ok": True, "dice_value": value}

    @database_sync_to_async
    def _move(self, player_id, content):
        room = GameRoom.objects.get(code=self.room_code)
        dice_value = room.state.get("last_dice")
        if room.status != GameRoom.Status.ACTIVE or room.state.get("active_player") != player_id or not dice_value:
            return {"type": "move", "ok": False, "message": "حرکت در این نوبت معتبر نیست."}
        token_id = str(content.get("token_id", player_id))[:24]
        positions = room.state.setdefault("positions", {})
        from_step = int(positions.get(player_id, 0))
        result = advance(from_step, dice_value)
        to_step = result["to"]
        positions[player_id] = to_step
        players = list(room.players.all().order_by("joined_at"))
        next_player = next((player for player in players if player.player_id != player_id), players[0] if players else None)
        room.state["last_dice"] = None
        room.state["winner"] = player_id if result["winner"] else None
        room.state["active_player"] = next_player.player_id if next_player and not result["winner"] else player_id
        room.turn_number += 1
        if result["winner"]:
            room.status = GameRoom.Status.FINISHED
        room.save(update_fields=["state", "turn_number", "status", "updated_at"])
        GameMove.objects.create(room=room, player_id=player_id, token_id=token_id, dice_value=dice_value, from_step=from_step, to_step=to_step)
        return {"type": "move", "ok": True, "from_step": from_step, "to_step": to_step, "event": result["event"], "winner": result["winner"], "next_player": room.state["active_player"]}
