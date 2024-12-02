from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.serializers.json import Serializer
from django.db.models import Q
from asgiref.sync import sync_to_async
from django.utils import timezone
from .serializers import *
from .models import Friend, Conversation, Message, User
from .design_patterns import ErrorBuilder
from .signals import *
from .chat_validators import *
import json

user_channels = {}

class ChatConsumer(AsyncWebsocketConsumer):

    def check_len_records(self, count, limit):
        return count if (count < limit) else limit

    @database_sync_to_async
    def get_online(self, user):
        friends = Friend.objects.filter(Q(user1=user) | Q(user2=user)).select_related('user1', 'user2')
        if friends is None:
            return None

        online_friends = []
        conversation_ids = []
        for friend in friends:
            if friend.user1 == user:
                if friend.user2.is_online:
                    online_friends.append(friend.user2)
                    c_id = friend.conversation_id.id
                    conversation_ids.append(c_id)
            else:
                if friend.user1.is_online:
                    online_friends.append(friend.user1)
                    c_id = friend.conversation_id.id
                    conversation_ids.append(c_id)

        serializer = OnlineSerializer(online_friends, many=True)
        data = serializer.data

        for i, datum in enumerate(data):
            datum['conversation_id'] = conversation_ids[i]
        return data

    @database_sync_to_async
    def get_conversations(self, user):
        friends = Friend.objects.filter(Q(user1=user) | Q(user2=user)).select_related('user1', 'user2')
        if friends is None:
            return None

        conversation_friend_pairs = []
        for friend in friends:
            conv = friend.conversation_id
            if friend.user1 == user:
                friend_user = friend.user2
            else:
                friend_user = friend.user1
            conversation_friend_pairs.append((conv, friend_user))
        
        sorted_conv_friend_pairs = sorted(conversation_friend_pairs, key=lambda pair: pair[0].last_date, reverse=True)
        if sorted_conv_friend_pairs:
             conversations, all_friends = zip(*sorted_conv_friend_pairs)
        else:
            conversations, all_friends = [], []


        conv_serializer = ConversationSerializer(conversations, many=True)
        friend_serializer = ConvFriendsSerializer(all_friends, many=True)

        conversations_data = conv_serializer.data
        friend_data = friend_serializer.data

        response = []

        for conv, friend in zip(conversations_data, friend_data):
            if conv.get('last_message') == "":
                continue
            conv_data = {
                'id': conv.get('id'),
                'last_message': conv.get('last_message'),
                'status': conv.get('status'),
                'last_date': conv.get('last_date'),
                'sender': conv.get('sender'),
                'friend': {
                    'id': friend.get('id'),
                    'username': friend.get('username'),
                    'avatar_link': friend.get('avatar_link'),
                    'online': friend.get('is_online'),
                }
            }
            response.append(conv_data)

        return response

    async def connect(self):
        # try : 

        current_user = self.scope['user']
        if current_user is None:
            await self.send(
                text_data=json.dumps({
                    'error':'ERROR: Invalid User'
                })
            )
            return
            

        online = await self.get_online(current_user)
        conversations = await self.get_conversations(current_user)
        self.current_user = current_user
        self.room_name = int(current_user.id)
        self.room_group_name = f'chat_{self.room_name}'
        user_channels[self.current_user.id] = self.channel_name
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.send(json.dumps({
            'online': online,
            'conversations': conversations,
        }))

        # except Exception as e:
        #     await self.send(
        #         text_data=json.dumps({
        #             'error': e
        #         })
        #     )

    async def disconnect(self, close_code):
        if self.current_user.id in user_channels:
            del user_channels[self.current_user.id] 
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
            event = data["type"]

            if event == 'messages':
                await self.handle_messages(data)
            elif event == 'send_message':
                await self.handle_send_message(data)
            elif event == 'online':
                await self.handle_online(data)
            elif event == 'friends':
                await self.handle_friends(data)
            elif event == 'search_friend':
                await self.handle_search_friend(data)
            elif event == 'getConversation':
                await self.handle_getConversation(data)
            else:
                await self.send(text_data=json.dumps({'error': 'ERROR: Invalid Event.'}))
                return
        except json.JSONDecodeError:
            self.send(text_data=json.dumps({'error': 'Invalid JSON format.'}))
            return

    async def send_update_after_accept_request(self, event):
        friend_data = event['friend_data']
        chat_name = event['chat_name']
        if chat_name:
            conversation = await sync_to_async(Conversation.objects.filter(thread_name=chat_name).first)()

        @sync_to_async
        def serialize_conversations(conversation):
            return ConversationSerializer(conversation).data

        @sync_to_async
        def serialize_online(friend_data):
            return OnlineSerializer(friend_data).data        

        if conversation:
            conversation_data = await serialize_conversations(conversation)
            conversation_id = conversation_data["id"]
        else:
            conversation_id = None
        # online_data = await serialize_online(friend_data)
        online_data = friend_data
        online_data["conversation_id"] = conversation_id
        await self.send(text_data=json.dumps({
            'type': 'update_data',
            'data': online_data,
        }))

    async def send_updated_data(self, event):
        update_data = event['update_data']
        chat_name = event['chat_name']
        if chat_name:
            conversation = await database_sync_to_async(Conversation.objects.filter(thread_name=chat_name).first)()
        if conversation:
            conv_id = conversation.id
        else:
            conv_id = None
        update_data['conversation_id'] = conv_id
        await self.send(text_data=json.dumps({
            'type': 'update_data',
            'data': update_data,
        }))

    async def send_delete_data(self, event):
        delete_data = event['delete_data']
        chat_name = event['chat_name']
        if chat_name:
            conversation = await database_sync_to_async(Conversation.objects.filter(thread_name=chat_name).first)()
        if conversation:
            conv_id = conversation.id
        else:
            conv_id = None
        await self.send(text_data=json.dumps({
            'type': 'delete_data',
            'conversation': conv_id,
            'user': delete_data
        }))
    

    #! Conversation signals.py
    async def send_updated_conversation_data(self, event):
        print(f'<--------------------------->::FINALLY::<--------------------------->')
        update_data = event['update_data']
        friend = event['friend']
        
        update_data['friend'] = friend
        await self.send(text_data=json.dumps({
            'type': 'conversation_update',
            'data': update_data
        }))


    async def update_conversation_listener(self):
        await check_update_conversation.connect(self.send_updated_conversation_data)

    async def disconnect_conversation_listener(self):
        await check_update_conversation.disconnect(self.send_updated_conversation_data)


    @database_sync_to_async
    def fetch_other_user(self, conversation_id, me):
        friend = Friend.objects.get(Q(conversation_id=conversation_id) & (Q(user1=me) | Q(user2=me)))
        return friend.user2 if friend.user1 == me else friend.user1

    def get_room_name(self, current_user, other_user):
        room_name = (
            f'{current_user.id}_{other_user.id}'
            if int(current_user.id) < int(other_user.id)
            else f'{other_user.id}_{current_user.id}'
        )
        room_group_name = f'chat_{room_name}'
        return room_group_name 

    @database_sync_to_async
    def get_messages(self, room_group_name):
        array_messages = Message.objects.select_related().filter(thread_name=room_group_name)
        serializer = MessageSerializer(array_messages, many=True)
        return serializer.data
    
    @database_sync_to_async
    def get_limited_messages(self, room_group_name, limit, last_message_id):
        array_messages = Message.objects.select_related().filter(thread_name=room_group_name)
        if last_message_id:
            last_message = Message.objects.get(id=last_message_id)
            array_messages = array_messages.filter(date__lt=last_message.date).select_related()


        if limit is None:
            limit = 10

        for message in array_messages:
            message.status = True

        array_messages = array_messages.order_by('-date')[:limit]
        array_messages = list(array_messages)
        array_messages.reverse()
        serializer = MessageSerializer(array_messages, many=True)
        return serializer.data


    async def handle_messages(self, data):

        if not validate_messages_request(data):
            await self.send(text_data=json.dumps({'error': 'Invalid request format.'}))
            return

        current_user = self.current_user
        conv_id = data["conversation_id"]

        conversation_id = await database_sync_to_async(Conversation.objects.filter(id=conv_id).first)()
        if conversation_id is None:
            await self.send(text_data=json.dumps({'error': '1Invalid request input.'}))
            return

        friend = await database_sync_to_async(Friend.objects.get)(Q(conversation_id=conv_id) & (Q(user1=current_user) | Q(user2=current_user)))
        if friend is None:
            await self.send(text_data=json.dumps({'error' : 'ERROR: You cannot load messages !'}))
            return

        if 'limit' in data:
            limit = data["limit"]
        else:
            limit = 10

        if 'message_id' in data:
            last_fetched_message = data['message_id']
        else:
            last_fetched_message = None


        other_user = await self.fetch_other_user(conv_id, current_user)
        if other_user is None:
            await self.send(text_data=json.dumps({'error': '2Invalid request input.'}))
            return

        room_group_name = self.get_room_name(current_user, other_user)
        messages = await self.get_limited_messages(room_group_name, limit, last_fetched_message)
        if 'limit' not in data:
            await self.channel_layer.group_add(str(room_group_name), self.channel_name)
        receiver_id = data["user_id"]
        receiver = await database_sync_to_async(User.objects.filter(id=receiver_id).first)()
        if receiver is None:
            await self.send(text_data=json.dumps({'error': '3Invalid request input.'}))
            return

        conversation_receiver = await database_sync_to_async(lambda: conversation_id.receiver)()
        if receiver == conversation_receiver:
            conversation_id.status = True
            await database_sync_to_async(conversation_id.save)()
        await self.send(text_data=json.dumps({'messages': messages}))

    @database_sync_to_async
    def create_conversation_in_channel(self, room_group_name, current_user, receiver, message):

        conversation_created = Conversation.objects.create(
            sender = current_user,
            receiver = receiver,
            last_message = message,
            thread_name = room_group_name,
            timestamp = timezone.now()
        )
    
        friend = Friend.objects.get(Q(user1=current_user, user2=receiver) | Q(user1=receiver, user2=current_user))
        friend.conversation_id = conversation_created
        friend.save()
        return conversation_created

    @database_sync_to_async
    def fetch_other_user_through_id(self,conversation_id):
        if conversation_id:
            current_user = self.current_user
            return conversation_id.user1 if conversation_id.user1 != self.current_user else conversation_id.user2


    @database_sync_to_async
    def update_last_message_sender(self, room_group_name, message, sender, receiver):
        record = Conversation.objects.filter(thread_name=room_group_name).first()
        record.last_message = message
        record.timestamp = timezone.now()
        record.sender = sender
        record.receiver = receiver
        record.status = False
        record.save()
        pass

    @database_sync_to_async
    def create_save_message_record(self, sender, receiver, message, conversation_id, thread_name):
        new_message = Message(
            thread_name=thread_name,
            conversation_id=conversation_id,
            sender=sender,
            receiver=receiver,
            status=False,
            content=message,
            message_type='Text',
        )
        new_message.save()
        pass



    async def handle_send_message(self, data):
        if not validate_send_message_request(data):
            await self.send(text_data=json.dumps({'error': 'Invalid request format.'}))
            return
        conv_id = data["id"]
        message = data["message"]
        sender = data["sender"]
        receiver = data["receiver"]

        if len(message) > 500:
            await self.send(text_data=json.dumps({'error':'ERROR: Invalid Size Message'}))
            return

        current_user = await database_sync_to_async(User.objects.filter(username=sender).first)()
        if current_user is None:
            await self.send(text_data=json.dumps({'error': 'Invalid request input.'}))
            return

        conversation_id = await database_sync_to_async(Conversation.objects.filter(id=conv_id).first)()
        if conversation_id is None:
            await self.send(text_data=json.dumps({'error': 'Invalid request input.'}))
            return

        other_user = await database_sync_to_async(User.objects.filter(username=receiver).first)()
        if other_user is None:
            await self.send(text_data=json.dumps({'error': 'Invalid request input.'}))
            return
        elif other_user == self.current_user:
            other_user = self.fetch_other_user_through_id(conversation_id)

        check_relation = await database_sync_to_async(Friend.objects.filter(conversation_id=conv_id).first)()
        if check_relation is None:
            await self.send(text_data=json.dumps({'error' : 'ERROR: You cannot send the message !'}))
            return

        room_group_name = self.get_room_name(current_user, other_user)
        await self.update_last_message_sender(room_group_name, message, current_user, other_user)
        await self.create_save_message_record(sender=current_user, message=message, receiver=other_user, conversation_id=conversation_id, thread_name=room_group_name)

        await self.channel_layer.group_send(
            str(room_group_name),
            {
                "type": "chat_message",
                "message": message,
                "receiver": receiver,
                "sender" : sender,
            }
        )       

    async def chat_message(self, event):
        message = event['message']
        receiver = event['receiver']
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message,
            'receiver': receiver,
            'sender' : sender,
        }))

    async def handle_online(self, data):

        if not validate_online_users_request(data):
            await self.send(text_data=json.dumps({'error': 'Invalid request format.'}))
            return

        current_user = self.current_user
        online = await self.get_online(current_user)
        await self.send(text_data=json.dumps({'online':online}))
    
    async def handle_friends(self, data):

        if not validate_friends_users_request(data):
            await self.send(text_data=json.dumps({'error': 'Invalid request format.'}))
            return            
        current_user = self.current_user
        offset = data["offset"]
        limit = data["limit"]

        friends = await get_all_friends(current_user, offset, limit)

        await self.send(text_data=json.dumps({'friends': friends}))
        def get_all_friends(user, offset, limit):
            friends = Friend.objects.select_related().filter(Q(user1=user) | Q(user2=user))
            if friends is None:
                return None
            limit = self.check_len_records(friends.count(), limit)
            friends = friends[int(offset): int(offset+limit)]
            all_friends = []
            for friend in friends:
                if friend.user1 == user:
                    all_friends.append(friend.user2)
                else:
                    all_friends.append(friend.user1)
            serializer = FriendsSerializer(all_friends, many=True)
            return serializer.data


    async def handle_search_friend(self, data):

        if not validate_search_friend_request(data):
            await self.send(text_data=json.dumps({'error': 'Invalid request format.'}))
            return

        current_user = self.current_user
        look_for = data["search"]
        offset = data["offset"]
        limit = data["limit"]

        search_friend = await get_search_friends(current_user, look_for, offset, limit)
        look_for = await sync_to_async(lambda: list(User.objects.filter(username__startswith=look_for)))()
        if not look_for:
            search_friend = None
            await self.send(text_data=json.dumps({'search_friend':search_friend}))
            return 

        @sync_to_async
        def get_friends():
            return list(Friend.objects.select_related().filter(
                (Q(user1=current_user) & Q(user2__in=look_for)) |
                (Q(user1__in=look_for) & Q(user2=current_user))
            ))

        found = await get_friends()
        if not found:
            search_friend = None
            await self.send(text_data=json.dumps({'search_friend':search_friend}))
            return 

        count = len(found)
        limit = self.check_len_records(count, limit)
        found = found[int(offset):int(offset + limit)]

        @sync_to_async
        def serialize_friends():
            return FriendsSerializer(found, many=True, context={'current_user': current_user}).data

        search_friend = await serialize_friends()
        await self.send(text_data=json.dumps({'search_friend':search_friend}))

    async def handle_getConversation(self, data):

        if not validate_get_conversations_request(data):
            await self.send(text_data=json.dumps({'error': 'Invalid request format.'}))
            return        

        current_user = self.current_user

        user1 = data["user1"]
        user1 = await database_sync_to_async(User.objects.filter(username=user1).first)()
        if user1 is None:
            await self.send(text_data=json.dumps({'error': 'Invalid request data.'}))
            return

        user2 = data["user2"]
        user2 = await database_sync_to_async(User.objects.filter(username=user2).first)()
        if user2 is None:
            await self.send(text_data=json.dumps({'error': 'Invalid request data.'}))
            return

        friend_record = await sync_to_async(
            lambda: Friend.objects.filter(
                (Q(user1__username=user1) & Q(user2__username=user2)) |
                (Q(user1__username=user2) & Q(user2__username=user1))
            ).select_related('user1', 'user2').first()
        )()

        conversation_id = friend_record.conversation_id_id if friend_record else None
        response = {
            'type' : 'getConversation',
            'id' : conversation_id
        }
        await self.send(text_data=json.dumps(response))