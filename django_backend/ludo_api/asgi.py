"""ASGI entry point serving HTTP and real-time WebSocket game rooms."""
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ludo_api.settings")

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

import game.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(AuthMiddlewareStack(URLRouter(game.routing.websocket_urlpatterns))),
})
