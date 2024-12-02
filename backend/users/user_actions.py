import re
import json
from django.db.models import Q 
from .utils  import * 
from .models import * 
from .serializers import GameSerializer 

def make_websocket_response(type,identifier,data ,code=200,message="ok"):
           res =  {
            "type":  type ,
            "code": code, 
            "message" : message ,
            "identifier": identifier,
            "data": data 
            }
           return json.dumps(res)

class UserActions():

    def BAD_REQUEST(type, identifier):
        return json.dumps({
            "type":  type ,
            "code": 400,
            "message": "bad request",
            "identifier": identifier
              })

    def online(user, username):   
        
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user, user2=user2)
            online   = False
            if relation == UserRelation.FRIEND:
                 online = user_status.isUserOnline(username=username)
            return make_websocket_response(type="online", identifier=username,data=  {"value" : online})

        except Exception as ex:
            return UserActions.BAD_REQUEST(type="user-action", identifier=username)

    def add(user, username):
        try:
            from  .notification  import NotificationManager
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user, user2=user2)
            print(f"{relation}")
            if relation == UserRelation.NONE:
                invi = Invitation.objects.create(sender=user, receiver=user2)
                invi.save()
                NotificationManager.friend_request(user,user2)
                return make_websocket_response(type="user-action",identifier=username,data=  {"value" : "add"})
            else:
                return UserActions.BAD_REQUEST(type="user-action",identifier=username)

        except Exception as ex:
            print(f"{ex}")
            return UserActions.BAD_REQUEST(type="user-action",identifier=username) 
    from django.utils import timezone


    def create_thread_name(user1, user2):
        other_id = user1.id if min(user1.id, user2.id) != user1.id else user2.id
        room_group_name = "chat_" + str(min(user1.id, user2.id)) + "_" + str(other_id)
        return room_group_name


    def make_conf(user1, user2):
        if user1 == user2:
            raise ValueError("Users must be different to create a conversation.")

        thread_name = UserActions.create_thread_name(user1, user2)
        conversation, created = Conversation.objects.get_or_create(
            thread_name=thread_name,
            defaults={
                'last_message': "",  
                'timestamp': timezone.now(),
                'sender': user1,
                'receiver': user2
            }
        )

        return conversation

    def accept(user, username):
        from .notification import NotificationManager
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user,user2=user2)
            if relation == UserRelation.REC_REQ:
                invi = Invitation.objects.filter(Q(sender=user2) | Q(receiver=user2))[0]
                invi.delete()
                conversation =  UserActions.make_conf(user ,user2); 
                friend = Friend.objects.create(user1=user, user2=user2,conversation_id=conversation)
                friend.save()
                NotificationManager.friend_request_accepted(acceptor=user, receiver=user2)
                return make_websocket_response(type="user-action", identifier=username,data=  {"value" : "accept"})
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)
        except Exception as ex:
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)

    def deny(user, username):
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user,user2=user2)
            if relation == UserRelation.REC_REQ:
                invi = Invitation.objects.filter(Q(sender=user2) | Q(receiver=user))[0]
                if invi == None:
                    return UserActions.BAD_REQUEST(type="user-action",identifier=username)
                invi.delete()
                return make_websocket_response(type="user-action", identifier=username,data=  {"value" : "deny"})
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)
        except Exception as ex:
            print(ex)
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)

    def block(user, username):
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user,user2=user2)
            if relation != UserRelation.BLOCKED and relation != UserRelation.BLOCKER:
             
                invi = Invitation.objects.filter(Q(sender=user2) | Q(receiver=user2))
                if invi == None:
                    return UserActions.BAD_REQUEST(type="user-action",identifier=username)
                for item in invi:
                    if item.sender == user or item.receiver:
                        item.delete()
                friends = Friend.objects.filter(Q(user1=user2) | Q(user2=user2))
                if friends == None:
                    return UserActions.BAD_REQUEST(type="user-action",identifier=username)
                for item in friends:
                    if item.user1 == user or item.user2 == user:
                        item.delete()
                block_record = Blocked_Friend.objects.create(blocker=user, blocked=user2)
                block_record.save()
                return make_websocket_response(type="user-action", identifier=username,data=  {"value" : "block"})
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)
        except Exception as ex:
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)

    def unblock(user, username):
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user,user2=user2)
            if relation != UserRelation.BLOCKER:
                 return UserActions.BAD_REQUEST(type="user-action",identifier=username)
            block_record =  Blocked_Friend.objects.get(blocker=user,blocked=user2)
            block_record.delete()
            return make_websocket_response(type="user-action", identifier=username,data=  {"value" : "unblock"})
        except Exception as ex:
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)
        
    def unfriend(user, username):
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user, user2=user2)
            if relation != UserRelation.FRIEND:
                 return UserActions.BAD_REQUEST(type="user-action",identifier=username)
            records =  Friend.objects.filter(Q(user1=user) | Q(user2=user))
            for item in records: 
                if item.user1 == user2 or item.user2 == user2:
                    item.delete()
            return make_websocket_response(type="user-action", identifier=username,data=  {"value" : "unfriend"})
        except Exception as ex:
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)

    def cancel(user, username):
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user, user2=user2)
            if relation != UserRelation.SEND_REQUEST:
                 return UserActions.BAD_REQUEST(type="user-action",identifier=username)
            record =  Invitation.objects.get(sender=user, receiver=user2)      
            record.delete()
            return make_websocket_response(type="user-action", identifier=username,data=  {"value" : "cancel"})
        except Exception as ex:
            return UserActions.BAD_REQUEST(type="user-action",identifier=username)
    
    def invite_game(user, username):
        from .notification import NotificationManager
        try:
            user2   =  User.objects.get(username=username)
            relation = get_relation(user1=user, user2=user2)
            if relation != UserRelation.FRIEND:
                 return UserActions.BAD_REQUEST(type="invite",identifier=username)
            match_invitation = MatchInvitation.objects.create(
            expire_date=timezone.now() + timedelta(hours=24),
            sender=user,
            receiver=user2,
        )     
            match_invitation.save();
            NotificationManager.game_invite(sender=user, receiver=user2, game_id=str(match_invitation.match_id));
            return make_websocket_response(type="invite", identifier=username,data=  {"value" : "ok"})
        except Exception as ex:
            return UserActions.BAD_REQUEST(type="invite",identifier=username)
     
class UserUpdates() :

    def update(user : User, data) -> str :
        try: 
            if data["identifier"] == 'username' :
                return  UserUpdates.update_username(user=user,username=data["data"]["value"])
            elif data["identifier"] == 'email' :
                return  UserUpdates.update_email(user=user,email=data["data"]["value"])
            elif data["identifier"] == 'tfa-change':
                return  UserUpdates.update_tfa_email(user=user,email=data["data"]["value"])
            elif data["identifier"] == 'tfa-status':
                return  UserUpdates.update_tfa_status(user=user,status=data["data"]["value"])
            elif data["identifier"] == 'game_settings':
                return  UserUpdates.update_game_settings(user=user,data=data["data"])
            elif data["identifier"] == 'password':
                return UserUpdates.update_password(user,data=data["data"])
            else:
                return UserActions.BAD_REQUEST(type="update",identifier="bad-identifier")
        except Exception as e:
            return UserActions.BAD_REQUEST(type="update",identifier=data["identifier"])

    def update_username(user, username):
        if username == None:
            return UserActions.BAD_REQUEST(type="update",identifier="?")
        regex = r'^[a-z][\w-]{2,15}[a-z\d]$'

        if re.match(regex, username):
            user_status.UpdateUserName(user.username, username)
            user.is_online = True
            username=username.lower()
            user.username=username.lower()
            try:
                user.save(update_fields=['username'])
                return make_websocket_response(type="update",identifier="username",data={"value": username}, message="username changed successfully")
            except:
                return make_websocket_response(type="update", identifier="username", data={"value": username},message="username already  exist ")
        else:
            return make_websocket_response(type="update",identifier="username",data={"value": username},code=404,message="invalid username syntax")

    def update_email(user, email):
            regex = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$'
            if  re.match(regex, email)  == None:
                return make_websocket_response(type="update", identifier="email", data={"value": email},code=404, message="Invalid Email Syntax")
            
            try:
                user.is_online = True
                email =  email.lower()
                user.email = email
                user.save(update_fields=['email'])
                return make_websocket_response(type="update",identifier="email",data={"value": email}, message="email changed successfully")
            except:
                return make_websocket_response(type="update", identifier="email", data={"value": "email"},code=404,message="invalid email  or exist email")
        
    def update_tfa_email(user, email):
        regex = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$'
        if  re.match(regex, email)  == None:
            return make_websocket_response(type="update", identifier="tfa-change", data={"value": email},code=404, message="Invalid Email Syntax")
        
        try:
            tfa_obj = Auth.objects.get(user_id=user)
            tfa_obj.content = email.lower()
            tfa_obj.is_enabled = True
            tfa_obj.save()
            return make_websocket_response(type="update", identifier="tfa-change", data={"value": email, "status": True},message="Tfa has been updated successfully")
        except Exception as e:
            tfa_obj =   Auth.objects.create(user_id=user, content=email,is_enabled=True)    
            tfa_obj.save()
            return make_websocket_response(type="update", identifier="tfa-change", data={"value": email, "status": True},message="Tfa has been created successfully")


    def update_tfa_status(user, status):
        try:
            tfa_obj = Auth.objects.get(user_id=user)
            tfa_obj.is_enabled = status
            tfa_obj.save()
            return make_websocket_response(type="update", identifier="tfa-status", data={"value": status},message="Tfa status has been updated successfully")
        except Exception as e:
            return make_websocket_response(type="update", identifier="tfa-status", data={"value": status},code=404, message="Invalid value")
   
    def update_game_settings(user, data):
        try:
            recored = game_settings = GameSettings.objects.get(user=user)

        except GameSettings.DoesNotExist:
            return make_websocket_response(type="update", identifier="game_settings", data={"value": "" },
                        code=404, message="can't find game Setting for this user {}")
        serializer = GameSerializer(game_settings, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            data = {
            "ball"          :     data["ball"],
            "paddle"       :     data["paddle"],
            "background"    :     data["background"]
            }
            return make_websocket_response(type="update", identifier="game_settings", data=data  ,message="update success ")
        return make_websocket_response(type="update", identifier="game_settings", data=None,code=404, message=str(serializer.errors))
       
    def update_password(user,data):
            bad_request = make_websocket_response(type="update", identifier="password", data={"value": "" },
                            code=404, message="Invalid data or bad password")
            try:
                regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$'
                old_password    =  data["old_password"]
                new_password    =  data["new_password"]
                if re.match(regex, new_password) and user.check_password(old_password):
                    if old_password == new_password:
                        return bad_request
                    user.set_password(new_password)
                    user.is_online = True
                    user.save(update_fields=['password'])
                    return  make_websocket_response(type="update", identifier="password", data={"value": "" },
                            code=200, message="Password has been changed successfully")
            except Exception as ex:
                pass
            return bad_request

############< getUserData >############

def getUserData(user, target):
    if not user or not target:
        return None
    relation = get_relation(user1=user,user2=target)
    if relation == UserRelation.BLOCKED or relation == UserRelation.BLOCKER:
        return None

    return {"username" : target.username,
        "profile_image" : f"{settings.BACKEND_URL}/{target.avatar_link.url}",
        "online" : True ,
        "profile" : f"/users/{target.username}",
        "level" : get_level(target)
        }
    
class user_status:
    onlineUser = {}
    def isUserOnline(username:str ) -> bool: 
        try:
            count  = user_status.onlineUser[username]
            return count != 0   
        except KeyError:
            return False
        
    def addToOnline(username):
            try:
                user = User.objects.filter(username=username).first()
                if user :
                    user.is_online = True
                    user.save(update_fields=['is_online'])
                    user_status.onlineUser[username] = user_status.onlineUser.get(username, 0) + 1
            except KeyError as err:
                user_status.onlineUser[username] = 0
    def RemoveOneOnline(username):
        try:
            user_status.onlineUser[username] -= 1; 
            if user_status.onlineUser[username] <= 0 :
                user = User.objects.filter(username=username).first()
                if user :
                    user.is_online = False
                    user.save(update_fields=['is_online'])
                    del user_status.onlineUser[username] 
            
        except KeyError as error:
            return
    
    def UpdateUserName(old_username, new_username):
        try:
            if old_username in user_status.onlineUser:
                user_status.onlineUser[new_username] = user_status.onlineUser.pop(old_username)
        except Exception as ex:
            pass
