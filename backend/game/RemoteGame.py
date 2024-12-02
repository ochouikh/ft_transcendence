import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Enum
import uuid
from asgiref.sync import sync_to_async
from users.utils import get_relation, UserRelation
from users.user_actions import getUserData
from users.models import MatchInvitation
from src.logger import log

class RemoteGame(AsyncWebsocketConsumer):
    games = {}
    async def connect(self):
        try:
            self.user =  self.scope['user']
            self.game_type = self.scope['url_route']['kwargs']['game_type']
            self.username = self.user.username
            self.id = 0
            self.group_name = self.opponent = self.game = self.task = None
            self.data = await sync_to_async(lambda: getUserData(self.user,self.user))()
            # self.username = self.scope['url_route']['kwargs']['username']
            log.info(f'{self.username} is connect')
            panding_game = self.search_panding_game(self.username)
            if panding_game:
                log.warning(f'{self.username} is in game')
                await self.accept()
                await self.send(text_data=json.dumps({Enum.TYPE:Enum.INGAME}))
                await self.close()
                return 
            if self.game_type == 'random':
                await self.random_matchmaking()
                log.info(RemoteGame.games)
                return 
            await self.invitation()
            log.info(RemoteGame.games)
        except Exception as e:
            log.error(f'exeption in connect: {e}')

    async def disconnect(self, close_code=1000):
        try:
            if self.group_name in RemoteGame.games and self.id in RemoteGame.games[self.group_name]:
                RemoteGame.games[self.group_name][self.id][0] = None
            if self.task:
                self.opponent.task = None
                self.task.cancel()
            if self.game and self.game.state != Enum.END:
                self.opponent.game = None
                data = {Enum.TYPE:Enum.DISCONNECT, Enum.STATUS:Enum.WIN, Enum.XP:80}
                await self.send_update(data, self.username)
                await sync_to_async(lambda: self.game.save_game(disconnect=True, user=self.user))()
            if self.opponent:
                self.opponent.opponent = None
            elif not self.opponent and self.group_name in RemoteGame.games:
                del RemoteGame.games[self.group_name]
            if self.group_name:
                await self.channel_layer.group_discard( # type: ignore
                        self.group_name,
                        self.channel_name
                    )
            await self.close(close_code)
            log.info(f'{self.username} is disconnect')
            log.info(RemoteGame.games)
        except Exception as e:
            log.error(f'exeption in disconnect: {e}')

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            type = text_data_json[Enum.TYPE]
            if type == 'update' and self.game and self.task:
                await self.game.update_paddle(socket=self, moves=float(text_data_json['y']))
        except Exception as e:
            log.error(f'exeption in receive: {e}')

    async def random_matchmaking(self):
        try:
            waiting_game = await self.search_random_match()
            if not waiting_game:
                self.id = 1
                self.uuid = uuid.uuid4()
                self.group_name = 'random_' + str(self.uuid)
                RemoteGame.games[self.group_name] = {
                    self.id: [self.username, self],
                }
                return await self.connect_socket()
            socket1 = RemoteGame.games[waiting_game][1][1]
            RemoteGame.games[waiting_game][2] = [self.username, self]
            self.id = 2
            self.uuid = socket1.uuid
            self.group_name = socket1.group_name
            socket1.opponent = self
            self.opponent = socket1
            await self.start_game()
        except Exception as e:
            log.error(f'exeption in random matchmaking: {e}')
    
    async def invitation(self):
        try:
            from users.notification import NotificationManager
            self.group_name = 'invitation_' + self.game_type
            self.uuid = uuid.UUID(self.game_type)
            match = await sync_to_async(lambda: MatchInvitation.objects.get(match_id=self.uuid))()
            if self.group_name not in RemoteGame.games:
                relation = await sync_to_async(lambda: get_relation(user1=match.receiver, user2=match.sender))()
                if self.user != match.receiver or relation == UserRelation.BLOCKED or relation == UserRelation.BLOCKER:
                    raise Exception("This game cannot be played")
                self.id = 1
                RemoteGame.games[self.group_name] = {
                    self.id: [self.username, self]
                }
                await sync_to_async(lambda:
                    NotificationManager.wait_to_play(sender=match.receiver, receiver=match.sender,game_id=str(self.uuid))
                )()
                return await self.connect_socket()
            await sync_to_async(lambda: match.delete())()
            socket1 = RemoteGame.games[self.group_name][1][1]
            RemoteGame.games[self.group_name][2] = [self.username, self]
            self.id = 2
            socket1.opponent = self
            self.opponent = socket1
            await self.start_game()
        except Exception as e:
            log.error(f'exeption invitation: {e}')

    async def start_game(self):
        try:
            self.opponent.game = self.game = Game(self.opponent, self)
            await self.connect_socket()
            self.game.state = Enum.RUNNING
            self.task = self.opponent.task = asyncio.create_task (
                self.game.run_game(goals=10, time_limite=300)
            )
        except Exception as e:
            log.error(f'exeption start_game: {e}')

    async def search_random_match(self):
        try:
            search= {
                key for key, value in RemoteGame.games.items() 
                if len(value) == 1 and key[:7] == 'random_'
            }
            if not search:
                return None
            waiting_game = list(search)[0]
            socket1 = RemoteGame.games[waiting_game][1][1]
            relation = await sync_to_async(lambda: get_relation(user1=socket1.user, user2=self.user))()
            if relation == UserRelation.BLOCKED or relation == UserRelation.BLOCKER:
                return None
            return waiting_game
        except Exception as e:
            log.error(f'exeption search_random_match: {e}')
    
    def search_panding_game(self, username):
        try:
            search = {key:value for key, value in RemoteGame.games.items() 
                if (1 in value and value[1][0] == username )
                or (2 in value and value[2][0] == username )
            }
            if not search:
                return None
            key = list(search)[0]
            return key
        except Exception as e:
            log.error(f'exeption search_panding_game: {e}')

    async def connect_socket(self):
        try:
            await self.channel_layer.group_add( # type: ignore
                self.group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            log.error(f'exeption in connect_socket: {e}')

    async def send_update(self, data=None, sender=''):
        try:
            if not data:
                return
            await self.channel_layer.group_send( # type: ignore
                self.group_name,
                {
                    Enum.TYPE: 'game.update',
                    'data': data,
                    'sender_channel': sender
                }
            )
        except Exception as e:
            log.error(f'exeption in send_update: {e}')

    async def game_update(self, event):
        if event['sender_channel'] == self.username:
            return
        data = event['data']
        await self.send(text_data=json.dumps(data))
