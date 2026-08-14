from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class GameRoom(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting"
        ACTIVE = "active", "Active"
        FINISHED = "finished", "Finished"

    class GameType(models.TextChoices):
        LUDO = "ludo", "Classic Ludo"
        SNAKES = "snakes", "Snakes and Ladders"

    code = models.CharField(max_length=24, unique=True)
    game_type = models.CharField(max_length=12, choices=GameType.choices, default=GameType.LUDO)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.WAITING)
    active_color = models.CharField(max_length=12, default="red")
    turn_number = models.PositiveIntegerField(default=1)
    state = models.JSONField(default=dict, blank=True)
    max_players = models.PositiveSmallIntegerField(default=2, validators=[MinValueValidator(2), MaxValueValidator(4)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.code} ({self.game_type}/{self.status})"


class RoomPlayer(models.Model):
    room = models.ForeignKey(GameRoom, related_name="players", on_delete=models.CASCADE)
    player_id = models.CharField(max_length=48)
    nickname = models.CharField(max_length=32)
    color = models.CharField(max_length=12, default="red")
    joined_at = models.DateTimeField(auto_now_add=True)
    is_connected = models.BooleanField(default=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["room", "player_id"], name="unique_player_in_room")]

    def __str__(self) -> str:
        return f"{self.nickname} @ {self.room.code}"


class GameMove(models.Model):
    room = models.ForeignKey(GameRoom, related_name="moves", on_delete=models.CASCADE)
    player_id = models.CharField(max_length=48, blank=True, default="")
    token_id = models.CharField(max_length=24)
    dice_value = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(6)])
    from_step = models.PositiveSmallIntegerField()
    to_step = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.room.code}: {self.token_id} {self.from_step}->{self.to_step}"
