from django.urls import path

from .consumers import RoomConsumer
from .matchmaking import MatchmakingConsumer

websocket_urlpatterns = [
    path("ws/matchmaking/", MatchmakingConsumer.as_asgi()),
    path("ws/rooms/<str:room_code>/", RoomConsumer.as_asgi()),
]
