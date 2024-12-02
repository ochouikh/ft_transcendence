from django.urls import re_path
from .RemoteGame import RemoteGame
from .RemoteTournament import RemoteTournament

websocket_urlpatterns = [ 
	re_path(r'ws/game/(?P<game_type>[0-9a-f-]{36}|\w+)/$', RemoteGame.as_asgi()),
	re_path(r'ws/game_tournament/(?P<playersNum>\w+)/(?P<alias>\w+)/$', RemoteTournament.as_asgi()),
] 

# websocket_urlpatterns = [ 
# 	re_path(r'ws/aigame/(?P<username>\w+)', AIGame.as_asgi()),
# 	re_path(r'ws/game/(?P<game_type>\w+)/(?P<username>\w+)', RemoteGame.as_asgi()),
# 	re_path(r'ws/game_tournament/(?P<playersNum>\w+)/(?P<alias>\w+)/$', RemoteTournament.as_asgi()),
# ] 


