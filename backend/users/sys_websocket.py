
import json 
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from users.models import User
from users.user_actions import UserActions , UserUpdates
from .serializers  import SystemSocketSerializer
from channels.generic.websocket import WebsocketConsumer 

from urllib.parse import parse_qs 
import uuid

from  .notification import NotificationManager
from .user_actions import user_status


class SystemSocket(WebsocketConsumer):
    allowed_type =   [
    "error"    ,  "online"     , "add",
    "accept"   ,  "deny"       , "block",
    "unblock"  ,  "unfriend"   , "cancel",
    "invite"   ,  "update"     , "broadcast",
    "noti_read",  "noti_clear" , "to_text"
]

    def connect(self):
        self.accept()
        self.user =  self.scope['user']
        user_status.addToOnline(self.user.username)

        self.room_name = str(uuid.uuid4()).replace("-","_")
        self.notification_name = f'notification_{self.user.username}'

        self.channel_layer = get_channel_layer()
        async_to_sync(self.channel_layer.group_add)(self.room_name, self.channel_name)
        async_to_sync(self.channel_layer.group_add)(self.notification_name, self.channel_name)


    def receive(self, text_data):
        data_dict = None
        try:
            print(text_data)
            data_dict = json.loads(text_data)
            serializer =  SystemSocketSerializer(data=data_dict)
            if serializer.is_valid() == False:
                raise  ValueError()  
            
            type = data_dict["type"]
            identifier = data_dict['identifier']  # this for check identifier is present  in  data_dict 
            print(f"sys.{type}")
            if not type in SystemSocket.allowed_type:
                type = "error"; 
            async_to_sync(self.channel_layer.group_send)(
            self.room_name ,
            {
                "type":f"sys.{type}",
                "data": data_dict
            }
            )
        except Exception as ex:
            async_to_sync(self.channel_layer.group_send)(self.room_name, {"type" :  "sys.error"})
            print(f" invalid Json{ex}")
    

    def sys_error(self, event):
            data = {"code": 400, "message": "bad request" }
            self.send(text_data= json.dumps(data))

    def sys_online(self, event):
        print("call -> online")
        data = UserActions.online(self.user, event["data"]['identifier'])
        self.send(text_data=data)

    def sys_add(self, event):
        data = UserActions.add(self.user, event["data"]['identifier'])
        self.send(text_data=data)
        pass

    def sys_accept(self, event):
        data = UserActions.accept(self.user, event["data"]['identifier'])
        self.send(text_data=data)
        pass

    def sys_deny(self, event):
        data = UserActions.deny(self.user, event["data"]['identifier'])
        self.send(text_data=data)
        pass

    def sys_block(self, event):
        data = UserActions.block(self.user, event["data"]['identifier'])
        self.send(text_data=data)
        pass

    def sys_unblock(self, event):
        data = UserActions.unblock(self.user, event["data"]['identifier'])
        self.send(text_data=data)
        pass

    def sys_unfriend(self, event):
        data = UserActions.unfriend(self.user, event["data"]['identifier'])
        self.send(text_data=data)
        pass

    def sys_cancel(self, event):
        data = UserActions.cancel(self.user, event["data"]['identifier'])
        self.send(text_data=data)
        pass

    def sys_invite(self, event):
        data = UserActions.invite_game(self.user, event["data"]['identifier'])
        self.send(text_data=data)


    def sys_update(self, event):
        data = UserUpdates.update(self.user,  event["data"])
        if data == None :
            data = {"code": 400, "message": "bad request" }.__str__()
        self.send(text_data=data)
        pass 

#  ==========<< notification function  >>>==================
    def sys_broadcast(self, event):
        try: 
            self.send(text_data = event["data"])
        except: 
            return 
        pass 

    def sys_noti_read(self, event):
        try: 
            data = NotificationManager.mark_as_read(self.user)
            self.send(text_data=data) # event["data"]['identifier'])
        except: 
            print("except in sys_noti_read")
            return 
        pass 
   
    def sys_noti_clear(self, event):
        try: 
            data = NotificationManager.delete_all(self.user)
            self.send(text_data=data) 
        except: 
            print("except in sys_noti_clear")
            return 
        pass

    def sys_to_text(self, event):
        try: 
            data = NotificationManager.to_text(self.user, id=event["data"]['identifier'])
            self.send(text_data=data)
        except Exception as ex: 
            print(f"except in sys_to_text{ex}")
            return 
        pass 

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(self.room_name , self.channel_name)
        async_to_sync(self.channel_layer.group_discard)(self.notification_name, self.channel_name)
        user_status.RemoveOneOnline(self.user.username)
        self.close()