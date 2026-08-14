from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class GameRoom(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting"
        ACTIVE = "active", "Active"
        FINISHED = "finished", "Finished"

    code = models.CharField(max_length=24, unique=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.WAITING)
    active_color = models.CharField(max_length=12, default="red")
    turn_number = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.code} ({self.status})"


class GameMove(models.Model):
    room = models.ForeignKey(GameRoom, related_name="moves", on_delete=models.CASCADE)
    token_id = models.CharField(max_length=24)
    dice_value = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(6)])
    from_step = models.PositiveSmallIntegerField()
    to_step = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.room.code}: {self.token_id} {self.from_step}->{self.to_step}"
