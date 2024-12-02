from django.db.models.signals import pre_save, post_save, pre_delete
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import User, Conversation, Friend
from .serializers import OnlineSerializer, ConversationSerializer
from src.logger import log

# from .consumers import user_channels  # Import the user_channels dictionary

# def check_update(sender, instance, **kwargs):
#     # print("\033[31m ===============> User SIGNAL DISABLE BY ALPHABEN <=======> - <======>\033[0m")
#     try:
#         old_instance = User.objects.get(pk=instance.pk)
#     except User.DoesNotExist:
#         old_instance = None

#     if old_instance:
#         if old_instance.is_online != instance.is_online or \
#             old_instance.avatar_link != instance.avatar_link or \
#                 old_instance.username != instance.username:
#             # serialize the data
#             serializer = OnlineSerializer(instance)
#             channel_layer = get_channel_layer()
#             print(f'Signals sent: {serializer.data}')
#             async_to_sync(channel_layer.group_send)(f'chat_{instance.id}', 
#                 {
#                     'type': 'send_updated_data',
#                     'update_data': serializer.data
#                 }
#             )

def check_update(sender, instance, **kwargs):
    try:
        old_instance = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        old_instance = None

    if old_instance:
        if old_instance.is_online != instance.is_online or \
            old_instance.username != instance.username:

            serializer = OnlineSerializer(instance)
            updated_data = serializer.data

            friend_user_1 = Friend.objects.filter(user1=instance)
            friend_user_2 = Friend.objects.filter(user2=instance)
            friends_list = list(friend_user_1) + list(friend_user_2)

            channel_layer = get_channel_layer()
            for friend in friends_list:
                the_friend = friend.user1 if friend.user2 == instance else friend.user2
                other_id = old_instance.id if min(old_instance.id, the_friend.id) != old_instance.id else the_friend.id
                chat_name = "chat_" + str(min(old_instance.id, the_friend.id)) + "_" + str(other_id)
                async_to_sync(channel_layer.group_send)(
                    f'chat_{the_friend.id}', {
                        'type': 'send_updated_data',
                        'update_data': updated_data,
                        'chat_name': chat_name
                    }
                )

pre_save.connect(check_update, sender=User)


# @receiver(post_save, sender=Friend)
#PENDING: this function must check if the Friends have already gotten any conversation before @!

from src.logger import log
def send_update_after_accept_request(sender, instance, created, **kwargs):


    try :
        if created :

            channel_layer = get_channel_layer()
            if instance.user1.id > instance.user2.id:
                maximum = instance.user1.id
            else:
                maximum = instance.user2.id
            
            chat_name = "chat_" + str(min(instance.user1.id, instance.user2.id)) + "_" + str(maximum)

            instance.user1.refresh_from_db()

            # updated_data_user1 = OnlineSerializer(instance.user1).data

            # if updated_data_user1["is_online"] is True:
            # instance_id = instance.user1.id
            async_to_sync(channel_layer.group_send)(
                f'chat_{instance.user2.id}', {
                    'type': 'send_update_after_accept_request',
                    'friend_data': OnlineSerializer(instance.user1).data,
                    'chat_name': chat_name
                }
            )


            instance.user2.refresh_from_db()
            # updated_data_user2 = OnlineSerializer(instance.user2).data
            # if updated_data_user2["is_online"] is True:
            # instance_id = instance.user2.id
            async_to_sync(channel_layer.group_send)(
                f'chat_{instance.user1.id}', {
                    'type': 'send_update_after_accept_request',
                    'friend_data': OnlineSerializer(instance.user2).data,
                    'chat_name': chat_name
                }
            )
    except Exception as e:
        log.error(f'Error : {e}')



post_save.connect(send_update_after_accept_request, sender=Friend)


def send_delete(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    if instance.user1.id > instance.user2.id:
        maximum = instance.user1.id
    else:
        maximum = instance.user2.id
    
    chat_name = "chat_" + str(min(instance.user1.id, instance.user2.id)) + "_" + str(maximum)

    instance.user1.refresh_from_db()

    updated_data_user1 = OnlineSerializer(instance.user1).data
    # updated_data_user1['type'] = 'unfriend'
    async_to_sync(channel_layer.group_send)(
        f'chat_{instance.user2.id}', {
            'type': 'send_delete_data',
            'delete_data': updated_data_user1,
            'chat_name': chat_name
        }
    )

    instance.user2.refresh_from_db()

    updated_data_user2 = OnlineSerializer(instance.user2).data
    # updated_data_user2['type'] = 'unfriend'
    async_to_sync(channel_layer.group_send)(
        f'chat_{instance.user1.id}', {
            'type': 'send_delete_data',
            'delete_data': updated_data_user2,
            'chat_name': chat_name
        }
    )

pre_delete.connect(send_delete, sender=Friend)



# Avoid importing user_channels here, instead use a method to get it dynamically
def get_user_channels():
    from users.consumers import user_channels
    return user_channels

def check_update_conversation(sender, instance, **kwargs):
    print("Signal handler triggered")
    
    try:
        old_instance = Conversation.objects.get(pk=instance.pk)
        # print(f"Old instance found: {old_instance}")
    except Conversation.DoesNotExist:
        old_instance = None
        print("No old instance found")
    
    if old_instance and old_instance.timestamp != instance.timestamp:
    # if old_instance and old_instance.last_message != instance.last_message:
        # print('<<<<<<<<<<<<<<<<<<<<<<------------------------------- SIGNALS ---------------------------------->>>>>>>>>>>>>>>>>>>>>')
        
        serializer = ConversationSerializer(instance)
        channel_layer = get_channel_layer()

        # print(f'Signals :: The Instance : {instance}')

        thread_name_parts = instance.thread_name.split('_')
        user_id1 = thread_name_parts[1]
        user_id2 = thread_name_parts[2]

        # print(f'NEW TESTING: user_id1: {user_id1} || user_id2: {user_id2}')

        # if str(instance.sender.id) == user_id1:
        #     receiver_id = User.objects.get(id=user_id2).id
        # else:
        #     receiver_id = User.objects.get(id=user_id1).id

        # user_channels = get_user_channels()

        # if receiver_id in user_channels:
        #     # print(f'SENDING ..........')
        #     async_to_sync(channel_layer.send)(
        #         user_channels[receiver_id],
        #         {
        #             'type': 'send_updated_conversation_data',
        #             'update_data': serializer.data
        #         }
        #     )

        # The update has to happen in both ways
        receiver = User.objects.get(id=user_id2)
        sender = User.objects.get(id=user_id1)

        receiver_id = receiver.id
        receiver_data = OnlineSerializer(receiver).data

        sender_id = sender.id
        sender_data = OnlineSerializer(sender).data

        user_channels = get_user_channels()

        log.info(f'SENDER 1 : {sender_data} ')

        if receiver_id in user_channels:
            async_to_sync(channel_layer.send)(
                user_channels[receiver_id],
                {
                    'type': 'send_updated_conversation_data',
                    'friend': sender_data,
                    'update_data': serializer.data
                }
            )
        
        log.info(f'SENDER 2 : {receiver_data} ')


        if sender_id in user_channels:
            async_to_sync(channel_layer.send)(
                user_channels[sender_id],
                {
                    'type': 'send_updated_conversation_data',
                    'friend': receiver_data,
                    'update_data': serializer.data
                }
            )


post_save.connect(check_update_conversation, sender=Conversation)
print("Signal check_update_conversation connected to Conversation pre_save")