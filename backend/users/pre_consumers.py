import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .serializers import MessageSerializer, ConversationSerializer, FriendsSerializer
from .models import Friend, Conversation, Message, User

from django.core.serializers.json import Serializer



# From Front-End: {'senderUsername': '', 'message': ''}

from django.db.models import Q
class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def make_conversation_json(self, conversation):
        print(f'Conversation :{conversation}')
        print(f'Sender_Username: {conversation.sender.conv_sender.username}')
        return json.dumps({
            "sender": conversation.sender.conv_sender.username,
            "is_online": True,
            "last_message": conversation.sender.conv_sender.last_message,
            "status": True,
            "last_date":  conversation.sender.conv_sender.last_date,
        })

    @database_sync_to_async
    def get_conversations(self, user_id):
        return list(Friend.objects.filter(Q(user1=user_id) | Q(user2=user_id)))

    # return "[{"sender", "is_online", "last_message", "last_date", "status"}}"
#     async def get_left_side_info(self, user):
#         user_id = user.id
#         conversations = await self.get_conversations(user_id)
#         conver_array = []
#         for conversation in conversations:
#             make_conversation = await self.make_conversation_json(conversation)
#             conver_array.insert(0, make_conversation)
#             print(conver_array)
#         return conver_array

# # return "{ "online":[], "all_friends":[] }"

#     async def get_right_side_info(self, user):
#         online = []
#         # online = await self.get_online_friends(user_id)
#         user_id = user.id
#         all_friends = await self.get_all_friends(user_id)
#         return json.dumps({
#             "online": online,
#             "all_friends": all_friends
#         })

    @database_sync_to_async
    def create_conversation_in_channel(self, current_user, room_group_name):
        # current_user_id = current_user.id
        conversation = Conversation.objects.create(
            sender = current_user,
            thread_name = room_group_name
        )
        return conversation

    @database_sync_to_async
    def get_user(self, username):
        user = User.objects.filter(username=username).first()
        return user

    @database_sync_to_async
    def get_online(self, user, offset, limit):
        user = self.scope["user"]
        friends = Friend.objects.filter(Q(user1=user) | Q(user2=user))[int(offset): int(offset+limit)]
        online_friends = []
        for friend in friends:
            if friend.is_online == True:
                friend.append(online_friends)
        return online_friends

    @database_sync_to_async
    def get_all_friends(self, user_id, offset, limit):
        friends = Friend.objects.filter(Q(user1=user_id) | Q(user2=user_id))[int(offset): int(offset+limit)]
        all_friends = []
        for friend in friends:
            friend.append(all_friends)
        serializer = FriendsSerializer(all_friends)
        return serializer.data

    @database_sync_to_async
    def get_search_friends(self, current_user, look_for, offset, limit):
        found = Friend.objects.filter(
            (Q(user1=current_user) & Q(user2=look_for)) |
            (Q(user1=look_for) & Q(user2=current_user)))
        if not found:
            return None
        found = found[int(offset): int(offset+limit)]
        serializer = FriendsSerializer(found.conversation_id)
        return serializer.data


    @database_sync_to_async
    def get_conversations(self, user, offset, limit):
        friends = Friend.objects.filter(Q(user1=user) | Q(user2=user))
        if not friends:
            return None
        friends = friends[int(offset): int(limit+offset)]
        serializer = ConversationSerializer(friends.conversation_id)
        return serializer.data

    @database_sync_to_async
    def get_search_conversation(self, current_user, look_for, offset, limit):
        found = Friend.objects.filter(
            (Q(user1=current_user) & Q(user2=look_for)) |
            (Q(user1=look_for) & Q(user2=current_user)))
        if not found:
            return None
        found = found[int(offset): int(offset+limit)]
        serializer = ConversationSerializer(found.conversation_id)
        return serializer.data
        

    async def connect(self):
        current_user = self.scope['user']
        # I will get the sender in the body -> initiate the channel_layer
        other_user_username = self.scope['url_route']['kwargs']['username']
        online = await self.get_online(current_user, 0, 10) # Endpoint : http://localhost:8000/chat/otherUser/?token={}&online_offset={}&online_limit={}
        friends = await self.get_all_friends(current_user, 0, 10) # Endpoint : http://localhost:8000/chat/otherUser/?token={}&friends_offset={}&friends_limit={}
        search_friend = await self.get_search_friends(current_user) # Endpoint : http://localhost:8000/chat/otherUser/?token={}&search_friend={}&offset={}&limit={}
        conversations = await self.get_conversations(current_user, 0, 10) # Endpoint : http://localhost:8000/chat/otherUser/?token={}&convs_offset={}&convs_limit={}
        search_conversation = await self.get_search_conversation(current_user) # Endpoint : http://localhost:8000/chat/otherUser/?token={}&search_conv={}&offset={}&limit={}
        if other_user_username is None:
            await self.send(
                text_data = json.dumps({
                    'online' : online,
                    'friends' : friends,
                    'conversations' : conversations
                })
            )

        other_user = await self.get_user(other_user_username)
    
        self.user1 = current_user
        self.user2 = other_user

        self.room_name = (
            f'{current_user.id}_{other_user.id}'
            if int(current_user.id) < int(other_user.id)
            else f'{other_user.id}_{current_user.id}'
        )

        self.room_group_name = f'chat_{self.room_name}'

        chat = await self.get_chat(self.room_group_name, 0, 20)
    
        print(f'room_group_name :{self.room_group_name}')
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        print(f'Close code: {close_code}')
        await self.channel_layer.group_discard(self.room_group_name, self.channel_layer)
        await self.disconnect()
    

    # @database_sync_to_async
    # def get_sender(self, username):
    #     sender = User.objects.filter(username=username).first()
    #     return sender

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

    def get_receiver_username(self, sender_username):
        return self.user1 if self.user1.username != sender_username else self.user2

    @database_sync_to_async
    def get_messages(self):

        # print(f'the conversation_is: {self.conversation_record}')
        array_messages = Message.objects.select_related().filter(thread_name=self.room_group_name)
        serializer = MessageSerializer(array_messages, many=True)
        # print(f'Serializer returns: {serializer.data}')
        return serializer.data
        # return array_messages

    @database_sync_to_async
    def update_last_message_sender(self, message, sender):
        self.conversation_record.last_message = message
        self.conversation_record.sender = sender
        self.conversation_record.save()
        pass


    @database_sync_to_async
    def check_conversation(self, sender, receiver):
        check_room = (
            f'{sender.id}_{receiver.id}'
            if int(sender.id) < int(receiver.id)
            else f'{receiver.id}_{sender.id}'
        )

        check_room_name = f'chat_{check_room}'

        conversation_record = Conversation.objects.filter(thread_name=check_room_name).first()
        return conversation_record

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        message = data["message"]
        sender_username = data["senderUsername"]

        sender = await self.get_user(sender_username)
        receiver = self.get_receiver_username(sender_username)

        check_room = await self.check_conversation(sender, receiver)
         # I need to check first if a room is created for those [sender<->receiver]
         # if yes -> llah yesser if no: channel_layer.group_add(self.room_group_name, self.channel_name) 

        if check_room is None:
            conversation_record = await self.create_conversation_in_channel(sender, self.room_group_name)
            self.conversation_record = conversation_record
            conversation_record.thread_name = self.room_group_name
            # self.conversation_id = conversation_record.id
        else :
            self.conversation_record = check_room
            self.room_group_name = self.conversation_record.thread_name
            await self.update_last_message_sender(message, sender)

        await self.create_save_message_record(sender=sender, message=message, receiver=receiver, conversation_id=self.conversation_record, thread_name=self.room_group_name)

        messages = await self.get_messages()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': message,
                'senderUsername': sender_username,
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
        username = event['senderUsername']
        messages = event['messages']

        set_messages =  await self.filter_messages(messages, self.scope['user'])

        await self.send(
            text_data=json.dumps(
                {
                    'message': message,
                    'senderUsername': username,
                    'messages': set_messages,
                }
            )
        )

# From Back-End: { 'message': message, 'senderUsername': username, 'messages': messages }
      