import json
from  .sys_websocket     import       *  
from  .user_actions      import  user_status 
from  .models            import  Notification
from  channels.layers    import get_channel_layer
from  asgiref.sync       import async_to_sync


class NotificationManager:
    #=====================<< Notification Types >> =====================
    TYPE_FRIEND_REQUEST     =   "friend-request"
    TYPE_GAME_REQUEST       =   "game-request"
    TYPE_TEXT               =   "text"
    TYPE_JOIN_GAME          =   "join-game"
    TYPE_JOIN_TOURNAMENT    =   "join-tournament"
    
    #=====================<< Notification Messages  >> =====================
    
    MESSAGE_GAME_WAIT               =  "Waiting for you to join the game"
    MESSAGE_TOURNAMENT_WAIT         =  "Waiting for you to join the tournament match"


    #=====================<< Function for Broadcast   >> =====================
    def make(notification_id, id, type=TYPE_FRIEND_REQUEST, content="", identifier="", read=True):
        return json.dumps({
        "type":  "notification",
        "code": 200,
        "message" : "notification", 
        "identifier" : identifier    ,
        "data": {
            "notification_id"  : 	notification_id,
            "type"      	   :    type            ,
            "content"  		   :  	content,
            "read" 			   : 	read,
            "id" 		       : 	id   
        }
    })

    def broadcast(user, data):
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
            f"notification_{user.username}",
            {
                "type":f"sys.broadcast",
                "data": data
            }   
            )
    pass


    def friend_request(sender, receiver):
        
        isOnline =  user_status.isUserOnline(username=receiver.username)
        content   = f"{sender.username} sent you a friend request"
        notification_obj = Notification.objects.create(
                content = content,
                status=isOnline ,
                type = NotificationManager.TYPE_FRIEND_REQUEST,
                callback = sender.username,
                user=receiver
                )
        notification_obj.save();
        if isOnline: 
            data = NotificationManager.make(
                            notification_id = notification_obj.id,
                            id              = notification_obj.callback,
                            type            = notification_obj.type, 
                            content         = notification_obj.content
                            )
            NotificationManager.broadcast(user=receiver,data=data)
        pass

    def friend_request_accepted(acceptor, receiver):
        
        isOnline =  user_status.isUserOnline(username=receiver.username)
        content   = f"{acceptor.username} has accepted your friend request"
        notification_obj = Notification.objects.create(
                content = content,
                status=isOnline ,
                type = NotificationManager.TYPE_TEXT,
                callback = acceptor.username,
                user=receiver
                )
        notification_obj.save();
        if isOnline: 
            data = NotificationManager.make(
                            notification_id = notification_obj.id,
                            id              = notification_obj.callback,
                            type            = notification_obj.type, 
                            content         = notification_obj.content
                            )
            NotificationManager.broadcast(user=receiver,data=data)
        pass

    def game_invite(sender, receiver, game_id):
        
        isOnline =  user_status.isUserOnline(username=receiver.username)
        content   = f"{sender.username} has invited you to play a game"
        notification_obj = Notification.objects.create(
                content = content,
                status=isOnline ,
                type = NotificationManager.TYPE_GAME_REQUEST,
                callback = game_id,
                user=receiver
                )
        notification_obj.save();
        if isOnline: 
            data = NotificationManager.make(
                            notification_id = notification_obj.id,
                            id              = notification_obj.callback,
                            type            = notification_obj.type, 
                            content         = notification_obj.content
                            )
            NotificationManager.broadcast(user=receiver,data=data)
        pass

    def wait_to_play(sender, receiver, game_id, msg=MESSAGE_GAME_WAIT):
        
        isOnline =  user_status.isUserOnline(username=receiver.username)
        content   = f"{sender.username} {msg}"
        notification_obj = Notification.objects.create(
                content = content,
                status=isOnline ,
                type = NotificationManager.TYPE_JOIN_GAME,
                callback = game_id,
                user=receiver
                )
        notification_obj.save();
        if isOnline: 
            data = NotificationManager.make(
                            notification_id = notification_obj.id,
                            id              = notification_obj.callback,
                            type            = notification_obj.type, 
                            content         = notification_obj.content
                            )
            NotificationManager.broadcast(user=receiver, data=data)
        pass

    #=====================<< Function for action    >> =====================

    def mark_as_read(user):
        from .user_actions import make_websocket_response 
        try:
                list_obj = Notification.objects.filter(user=user)
                for obj in list_obj: 
                    obj.status = True;
                return make_websocket_response(type="noti_read", identifier="", data=None, code=200, message="success")
        except:
            return  make_websocket_response(type="noti_read",identifier="", data=None, code=404, message="notification bad request")
   
    def delete_all(user):
        from .user_actions import make_websocket_response 
        try:
                list_obj = Notification.objects.filter(user=user)
                for obj in list_obj: 
                    obj.delete();
                return make_websocket_response(type="noti_delete", identifier="", data=None, code=200, message="notification: clear success")
        except:
            return  make_websocket_response(type="noti_delete",identifier="", data=None, code=404,message="failed to clear")
    pass

    def to_text(user, id):
        from .user_actions import make_websocket_response 
        try:
                obj = Notification.objects.get(id=id)
                if obj.user != user: 
                        return  make_websocket_response(type="to_text", identifier="", data=None, code=403, message="notification: Unauthorized operation")
                obj.type = NotificationManager.TYPE_TEXT
                obj.callback = ""
                obj.save()
                return make_websocket_response(type="to_text", identifier="", data=None, code=200, message="notification: convert success")
        except:
            return  make_websocket_response(type="to_text",identifier="", data=None, code=404, message="notification:   not found or operation failed")
    pass