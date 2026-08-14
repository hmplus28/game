"""Small origin allow-list for a separately hosted React frontend."""
import os

from django.http import HttpResponse


class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_origins = {origin.strip() for origin in os.environ.get("DJANGO_CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()}

    def __call__(self, request):
        origin = request.headers.get("Origin", "")
        if request.method == "OPTIONS":
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)
        if origin in self.allowed_origins:
            response["Access-Control-Allow-Origin"] = origin
            response["Vary"] = "Origin"
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
