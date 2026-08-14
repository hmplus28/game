from django.test import SimpleTestCase

from .rules import advance


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
