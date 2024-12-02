from django.urls import path
from . import consumers , sys_websocket 

websocket_urlpatterns = [
    path('ws/chat/', consumers.ChatConsumer.as_asgi()),
    path('ws/sys/', sys_websocket.SystemSocket.as_asgi())
]
