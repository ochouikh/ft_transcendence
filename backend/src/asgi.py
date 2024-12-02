import os
import django 
django.setup()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

from channels.auth import AuthMiddlewareStack 
from channels.routing import ProtocolTypeRouter, URLRouter 
from django.core.asgi import get_asgi_application 
import game.routing 
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from .channelsmiddleware import JwtAuthMiddlewareStack
import users.routing



websocket_urlpatterns = []
for item in  users.routing.websocket_urlpatterns:
    websocket_urlpatterns.insert(0, item)

for item in  game.routing.websocket_urlpatterns:
    websocket_urlpatterns.insert(0, item)


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JwtAuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})


