from django.contrib import admin

from .models import GameMove, GameRoom, RoomPlayer


@admin.register(GameRoom)
class GameRoomAdmin(admin.ModelAdmin):
    list_display = ("code", "game_type", "status", "active_color", "turn_number", "updated_at")
    list_filter = ("game_type", "status", "active_color")
    search_fields = ("code",)


@admin.register(GameMove)
class GameMoveAdmin(admin.ModelAdmin):
    list_display = ("room", "token_id", "dice_value", "from_step", "to_step", "created_at")
    list_filter = ("dice_value",)
    search_fields = ("room__code", "token_id")


@admin.register(RoomPlayer)
class RoomPlayerAdmin(admin.ModelAdmin):
    list_display = ("nickname", "room", "color", "is_connected", "joined_at")
    list_filter = ("color", "is_connected")
    search_fields = ("nickname", "room__code")
