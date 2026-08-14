from django.test import SimpleTestCase

from asgiref.sync import async_to_sync
from django.test import SimpleTestCase, TestCase

from .consumers import RoomConsumer
from .models import GameRoom, RoomPlayer
from .rules import advance, resolve_capture


class SnakeRulesTests(SimpleTestCase):
    def test_normal_move(self):
        self.assertEqual(advance(10, 4), {"from": 10, "to": 14, "event": "move", "winner": False})

    def test_ladder_move(self):
        self.assertEqual(advance(18, 2), {"from": 18, "to": 77, "landing": 20, "event": "ladder", "winner": False})

    def test_snake_move(self):
        self.assertEqual(advance(93, 2), {"from": 93, "to": 75, "landing": 95, "event": "snake", "winner": False})

    def test_exact_finish_required(self):
        self.assertEqual(advance(98, 4), {"from": 98, "to": 98, "event": "blocked", "winner": False})
        self.assertEqual(advance(98, 2), {"from": 98, "to": 100, "event": "move", "winner": True})

    def test_landing_on_rival_captures_to_start(self):
        outcome = resolve_capture({"arya": 42, "arka": 45}, "arya", 45)
        self.assertEqual(outcome, {"positions": {"arya": 42, "arka": 0}, "captured": "arka"})

    def test_start_square_does_not_capture(self):
        outcome = resolve_capture({"arya": 0, "arka": 0}, "arya", 0)
        self.assertEqual(outcome, {"positions": {"arya": 0, "arka": 0}, "captured": None})


class OnlineCaptureTests(TestCase):
    def test_online_move_captures_rival_and_resets_position(self):
        room = GameRoom.objects.create(code="CAPTURE-TEST", status=GameRoom.Status.ACTIVE, state={"active_player": "arya", "last_dice": 3, "positions": {"arya": 42, "arka": 45}, "winner": None, "last_capture": None})
        RoomPlayer.objects.create(room=room, player_id="arya", nickname="آرین", color="red")
        RoomPlayer.objects.create(room=room, player_id="arka", nickname="آرکا", color="blue")
        consumer = RoomConsumer()
        consumer.room_code = room.code

        result = async_to_sync(consumer._move)("arya", {"token_id": "arya"})

        room.refresh_from_db()
        self.assertTrue(result["ok"])
        self.assertEqual(result["capture"]["target"], "arka")
        self.assertEqual(room.state["positions"], {"arya": 45, "arka": 0})
