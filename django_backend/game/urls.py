from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("game/roll/", views.roll_dice, name="roll-dice"),
    path("game/move/", views.record_move, name="record-move"),
    path("game/room/<str:room_code>/", views.room_state, name="room-state"),
]
