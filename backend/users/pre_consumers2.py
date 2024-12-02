import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .serializers import MessageSerializer, ConversationSerializer, FriendsSerializer, OnlineSerializer, ConvFriendsSerializer
from .models import Friend, Conversation, Message, User
from .design_patterns import ErrorBuilder

from django.core.serializers.json import Serializer
from django.db.models import Q


user_connections = {}

class ChatConsumer(AsyncWebsocketConsumer):

    def check_len_records(self, count, limit):
        return count if (count < limit) else limit

    @database_sync_to_async
    def get_online(self, user):
        friends = Friend.objects.filter(Q(user1=user) | Q(user2=user))
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

        # print(f'Serialization: {serializer.data}')
        # print(f'Conversations: {conversation_ids}')

        for i, datum in enumerate(data):
            datum['conversation_id'] = conversation_ids[i]

        # print(f'End: {data}')
        return data


    @database_sync_to_async
    def get_all_friends(self, user, offset, limit):
        friends = Friend.objects.filter(Q(user1=user) | Q(user2=user))
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

    @database_sync_to_async
    def get_conversations(self, user):
        friends = Friend.objects.filter(Q(user1=user) | Q(user2=user)).select_related('user1', 'user2')
        if friends is None:
            return None
        
        conversations = []
        all_friends = []
    
        for friend in friends:
            conversations.append(friend.conversation_id)
            if friend.user1 == user:
                all_friends.append(friend.user2)
            else:
                all_friends.append(friend.user1)

        conv_serializer = ConversationSerializer(conversations, many=True)
        friend_serializer = ConvFriendsSerializer(all_friends, many=True)

        conversations_data = conv_serializer.data
        friend_data = friend_serializer.data

        response = []

        for conv, friend in zip(conversations_data, friend_data):
            conv_data = {
                'id': conv.get('id'),
                'last_message': conv.get('last_message'),
                'status': conv.get('status'),
                'last_date': conv.get('last_date'),
                'sender': conv.get('sender'),
                'friend': {
                    'username': friend.get('username'),
                    'avatar': friend.get('avatar_link'),
                    'online': friend.get('is_online'),
                }
            }
            response.append(conv_data)

        return response

    async def connect(self):
        print(f'<-------------------------- CONNECT -----> : {self}')
        # in the first init, token must be in the Querystring

        # if not self.conversationId:
        #     pass

        current_user = self.scope['user']
        online = await self.get_online(current_user)
        print(f'Connect: ONLINE: {online}')
        conversations = await self.get_conversations(current_user)
        print(f'Connect: CONVS: {conversations}')

        # self.user1 = current_user
        self.current_user = current_user

        self.room_name = int(current_user.id)
        self.room_group_name = f'chat_{self.room_name}'


        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        await self.send(json.dumps({
            'online': online,
            'conversations': conversations
        }))
        user_connections[self.current_user.id] = self



    async def disconnect(self, close_code):
        # print(f'<-------------------------- DISCONNECT -----> : {close_code}')
        # del user_connections[user_id]
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        # await self.channel_layer.group_discard(self.room_group_name, self.channel_layer)
        await self.disconnect()


    def get_search_friends(self, current_user, look_for, offset, limit):
        found = Friend.objects.filter(
            (Q(user1=current_user) & Q(user2=look_for)) |
            (Q(user1=look_for) & Q(user2=current_user)))

        if not found:
            return None

        limit = self.check_len_records(found.count(), limit)
        friends = friends[int(offset): int(limit+offset)]

        serializer = FriendsSerializer(friends, many=True)
        return serializer.data
    
    @database_sync_to_async
    def get_search_conversation(self, current_user, look_for, offset, limit):
        found = Friend.objects.filter(
            (Q(user1=current_user) & Q(user2=look_for)) |
            (Q(user1=look_for) & Q(user2=current_user)))

        if not found:
            return None


        limit = self.check_len_records(found.count(), limit)
    
        found = found[int(offset): int(offset+limit)]
        conversations = []

        for unit in found:
            conversations.append(unit.conversation_id)

        serializer = ConversationSerializer(conversations, many=True)
        return serializer.data
 


    def update_last_message_sender(self, room_group_name, message, sender):

        record = Conversation.objects.filter(thread_name=room_group_name).first()
        record.last_message = message
        record.sender = sender
        record.save()
        pass

    @database_sync_to_async
    def create_conversation_in_channel(self, room_group_name, current_user, sender):

        conversation = Conversation.objects.create(
            sender = sender,
            thread_name = room_group_name
        )
    
        friend = Friend.objects.create(
            user1 = current_user,
            user2 = sender,
            conversation_id = conversation
        )
        return conversation



    def get_room_name(self, current_user, other_user):
        room_name = (
            f'{current_user.id}_{other_user.id}'
            if int(current_user.id) < int(other_user.id)
            else f'{other_user.id}_{current_user.id}'
        )

        room_group_name = f'chat_{room_name}'
        return room_group_name


    @database_sync_to_async
    def create_save_message_record(self, sender, receiver, message, conversation_id, thread_name):
        Message.objects.create(
            thread_name=thread_name,
            conversation_id=conversation_id,
            sender=sender,
            receiver=receiver,
            status=True,
            content=message,
            message_type='Text',
        )

    @database_sync_to_async
    def get_messages(self, room_group_name):
        array_messages = Message.objects.select_related().filter(thread_name=room_group_name)
        serializer = MessageSerializer(array_messages, many=True)
        # print(f'Serializer returns: {serializer.data}')
        return serializer.data

    async def send_message(self, conv_id, current_user, sender, message):
        current_user = self.current_user
        other_user = User.objects.filter(username=sender).first()
        if other_user is None:
            error = ErrorBuilder().set_type('Event').set_message('Invalid Event').build()
            await self.send(error)
            pass

        conversation_id = Friend.objects.filter(id=conv_id).first()
        if conversation_id is None:
            # Create a conversation room for those two users

            room_group_name = self.get_room_name()
            await self.create_conversation_in_channel(room_group_name, current_user, sender)
            
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)


        await self.update_last_message_sender(room_group_name, message, sender)
        await self.create_save_message_record(sender=other_user, message=message, receiver=current_user, conversation_id=conversation_id, thread_name=self.room_group_name)


        messages = await self.get_messages(room_group_name)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender,
                'messages': messages,
            }
        )

        async def filter_messages(self, record_messages, me):
            set_messages = []
            me_username = me.username.strip()

            for record_message in record_messages:
                sender_username = record_message["sender"].strip()
                receiver_username = record_message["receiver"].strip()

            if sender_username == me_username:
                set_messages.insert(0, {'sent': record_message["content"], 'date': record_message["date"]})
            elif receiver_username == me_username:
                set_messages.insert(0, {'received': record_message["content"], 'date': record_message["date"]})

            return set_messages

        async def chat_message(self, event):
            message = event['message']
            username = event['sender']
            messages = event['messages']

            set_messages =  await self.filter_messages(messages, self.scope['user'])

            await self.send(
            text_data=json.dumps(
                {
                    'message': message,
                    'sender': username,
                    'messages': set_messages,
                }
            )
        )

    # @database_sync_to_async
    # def fetch_other_user(conversation_id, me):
    #     friend = Friend.objects.get(Q(conversation_id=conversation_id) & (Q(user1=me) | Q(user2=me)))
    #     return friend.user2 if friend.user1 == me else friend.user1

    async def receive(self, text_data=None, bytes_data=None):

        print(f'<-------------------------- RECEIVE -----> : {text_data}')
        data = json.loads(text_data)
        event = data["type"] 
        # current_user_id = data["user_id"]
        
        # if "user_id" not in data:
        #     current_user = self.current_user
        #     # consumer = user_connections[current_user_id]
        # elif data["user_id"] is None:
        #     error = ErrorBuilder().set_type('user_id').set_message('Invalid User_ID').build()
        #     await self.send(text_data=json.dumps(error))
        #     pass
        # else:
        #     current_user_id = data["user_id"]
        #     current_user = await database_sync_to_async(User.objects.filter(id=current_user_id).first)()

        if event == 'messages':
            await self.handle_messages(data)
        elif event == 'testing':
            offset = data["offset"]
            limit = data["limit"]



        # if event == 'send_message':
        #     conv_id = data["id"]
        #     message = data["message"]
        #     sender = data["sender"]
        #     # This func would send the message and broadcast it
        #     # await self.send_message(conv_id, current_user, sender, message)

        #     current_user = self.current_user
        #     other_user = User.objects.filter(username=sender).first()
        #     if other_user is None:
        #         error = ErrorBuilder().set_type('Event').set_message('Invalid Event').build()
        #         await self.send(error)
        #         pass

        #     conversation_id = Friend.objects.filter(id=conv_id).first()
        #     if conversation_id is None:
        #         # Create a conversation room for those two users

        #         room_group_name = self.get_room_name()
        #         await self.create_conversation_in_channel(room_group_name, current_user, sender)
                
        #         await self.channel_layer.group_add(self.room_group_name, self.channel_name)


        #     await self.update_last_message_sender(room_group_name, message, sender)
        #     await self.create_save_message_record(sender=other_user, message=message, receiver=current_user, conversation_id=conversation_id, thread_name=self.room_group_name)


        #     messages = await self.get_messages(room_group_name)

        #     # Send message to room group
        #     await self.channel_layer.group_send(
        #         self.room_group_name,
        #         {
        #             'type': 'chat.message',
        #             'message': message,
        #             'sender': sender,
        #             'messages': messages,
        #         }
        #     )

        #     async def filter_messages(self, record_messages, me):
        #         set_messages = []
        #         me_username = me.username.strip()

        #         for record_message in record_messages:
        #             sender_username = record_message["sender"].strip()
        #             receiver_username = record_message["receiver"].strip()

        #         if sender_username == me_username:
        #             set_messages.insert(0, {'sent': record_message["content"], 'date': record_message["date"]})
        #         elif receiver_username == me_username:
        #             set_messages.insert(0, {'received': record_message["content"], 'date': record_message["date"]})

        #         return set_messages

        #     async def chat_message(self, event):
        #         message = event['message']
        #         username = event['sender']
        #         messages = event['messages']

        #         set_messages =  await self.filter_messages(messages, self.scope['user'])

        #         await self.send(
        #         text_data=json.dumps(
        #             {
        #                 'message': message,
        #                 'sender': username,
        #                 'messages': set_messages,
        #             }
        #         )
        #     )

        # if event == 'online':
        #     print(f'BEFORE: current_user: {current_user}, offset: {offset}, limit: {limit}')
        #     online = await self.get_online(current_user)
        #     print(f'AFTER: current_user: {current_user}, offset: {offset}, limit: {limit}')
        #     await self.send(
        #         text_data=json.dumps({
        #             'online': online
        #         })
        #     )
            
        # elif event == 'friends':
        #     friends = await self.get_all_friends(current_user, offset, limit)
        #     print(f"To FRONT-END: {friends}")
        #     await consumer.send(
        #         text_data=json.dumps({
        #             'friends': friends
        #         })
        #     )
            
        # elif event == 'search_friend':
        #     look_for = data["search"]
            # search_friend = await self.get_search_friends(current_user, look_for, offset, limit)
        #     print(f"To FRONT-END: {search_friend}")
        #     await consumer.send(
        #         text_data=json.dumps({
        #             'search_friend': search_friend
        #         })
        #     )
        # elif event == 'conversations':
        #     conversations = await self.get_conversations(current_user)
        #     print(f"To FRONT-END: {conversations}")
        #     await consumer.send(
        #         text_data=json.dumps({
        #             'conversations': conversations
        #         })
        #     )
        # elif event == 'search_conversation':
        #     look_for = data["search"]
            search_conversation = await self.get_search_conversation(current_user, look_for, offset, limit)
        #     print(f"To FRONT-END: {search_conversation}")
        #     await consumer.send(
        #         text_data=json.dumps({
        #             'search_conversation': search_conversation
        #         })
        #     )
        # else:
        #     error = ErrorBuilder().set_type('Event').set_message('Invalid Event').build()
        #     await self.send(error)
        #     pass



    async def handle_messages(self, data):

        if "user_id" not in data:
            current_user = self.current_user
            # consumer = user_connections[current_user_id]
        elif data["user_id"] is None:
            error = ErrorBuilder().set_type('user_id').set_message('Invalid User_ID').build()
            await self.send(text_data=json.dumps(error))
            pass
        else:
            current_user_id = data["user_id"]
            current_user = await database_sync_to_async(User.objects.filter(id=current_user_id).first)()

        conv_id = data["conversation_id"]

        current_user = self.current_user

        conversation_id = await database_sync_to_async(Conversation.objects.filter(id=conv_id).first)()

        @database_sync_to_async
        def fetch_other_user(conversation_id, me):
            friend = Friend.objects.get(Q(conversation_id=conversation_id) & (Q(user1=me) | Q(user2=me)))
            return friend.user2 if friend.user1 == me else friend.user1

        if conversation_id is None:
            error = ErrorBuilder().set_type('conversation_id').set_message('Invalid Conversation_ID').build()
            await self.send(text_data=json.dumps(error))
            pass

        other_user = await fetch_other_user(conversation_id, current_user)
        room_group_name = self.get_room_name(current_user, other_user)

        # async def filter_messages(record_messages, me):
        #     set_messages = []
        #     me_username = me.username.strip()

        #     for record_message in record_messages:
        #         sender_username = record_message["sender"].strip()
        #         receiver_username = record_message["receiver"].strip()

        #         if sender_username == me_username:
        #             set_messages.insert(0, {'sent': record_message["content"], 'date': record_message["date"]})
        #         elif receiver_username == me_username:
        #             set_messages.insert(0, {'received': record_message["content"], 'date': record_message["date"]})

        #     print(f"END: {set_messages}")
        #     return set_messages

        print(f"room_name: {room_group_name}")

        messages = await self.get_messages(room_group_name)
        # set_messages = await filter_messages(messages, self.scope['user'])


        print(f"To front: {messages}")

        await self.send(
            text_data=json.dumps(
                {
                    'messages': messages,
                }
            )
        )