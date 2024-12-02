# Standard Library Imports
import random
import secrets
import uuid
import json

# Third-party Libraries
from django.conf import settings
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.models import Token

# Local Imports
from .models import *  
from .serializers import *
from .utils import *
from .validators import *
from .user_actions import user_status
from src.errors import INVALID_PARAMS_RES, INVALID_TOKEN_RES, USER_NOT_FOUND_RES
from src.logger import log
from .design_patterns import *
from .tfa_utils import send_otp, check_otp_is_enabled
from .oauth2 import GoogleOAuth, insert_user_in_db, check_registration, School_OAuth
from .backends import CustomAuthenticationBackend


JWT_authenticator = JWTAuthentication()


# Create your views here.
class CustomAPIView(APIView):
    def get(self, request, format=None):
        api_endpoints = {
            #? Add other endpoints here as needed
            'register': reverse('users:register', request=self.request),
            'login': reverse('users:login', request=self.request),
            'refresh-token': reverse('users:refresh', request=self.request),
            'generate-googlelink': reverse('users:googlelink', request=self.request),
            'generate-42link': reverse('users:42_Link', request=self.request),
            'tfa': reverse('users:2FA_check', request=self.request),
            'forget-password': reverse('users:forget-password', request=self.request),
            'update-password': reverse('users:reset-passowrd', request=self.request),
            'oauth-register': reverse('users:OAuth_Register', request=self.request),
            # 'logout': 
        }
        return Response(api_endpoints, status=status.HTTP_200_OK)


def generate_auth_response(user,redirection='/dashboard', check=True)-> Response:
        auth_record = check_otp_is_enabled(user)
        print(f' user : {user}')
        if check == True and auth_record and auth_record.is_enabled is True:
            print(f' 2FA INSIDE : {auth_record}')
            token = generate_token_user(user)
            otp_error = send_otp(token, auth_record)
            print(f'OTP ERROR :{otp_error}')
            if otp_error !=  None: 
                return Response(otp_error,status=404)
            response = TwoFA_Builder().set_is_enabled('True').set_token(token.token).set_redirection('/2fa').build()
            print(f'RESPONSE : {response}')
            return Response(response, status=status.HTTP_200_OK)
        else :
            print(f' 2FA OUTSIDE ')
            jwt_data = generate_jwt(user)
            json_response = {'access_token': jwt_data['access'], 'redirection': redirection }
            response = Response(json_response, status=status.HTTP_200_OK)
            response.set_cookie(
                key = settings.SIMPLE_JWT['AUTH_COOKIE'],
                value = jwt_data['refresh'],
                expires = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                httponly = settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite = settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            return response
    
class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        
        response.delete_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            domain=settings.SIMPLE_JWT.get('AUTH_COOKIE_DOMAIN', None),
            path='/',
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        )
        
        response.delete_cookie('sessionid')
        response.delete_cookie('csrftoken')

        return response


class RegistrationView(APIView):

    def normal_registration_type(self, request):
        serializer = RegistrationSerializer(data=request.data['data'])
        try:
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                message = Message_Builder().set_message('Your account has been created successfully').set_redirection('/login').build()
                return Response(message, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            error_message = e.detail
            errors = {}
            for field, field_errors in error_message.items():
                errors[field] = field_errors[0]
            errors = ErrorBuilder().set_type('').set_message(errors).build()
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    def handle_google_oauth(self, code, state):
        oauth = GoogleOAuth(code=code, state=state)
        token = Tokens.objects.get(token=state)
        token.delete()
        
        data = oauth.getUserData()
        user = check_registration(data['email'])
        if user != None :
            return generate_auth_response(user)            
        else:
            filtered_data = {'username': data['name'], 'email': data['email'], 'image_url': data['picture']}
            user = insert_user_in_db(filtered_data)
            is_sccuess  =  get_extern_image(user,filtered_data['image_url'])
            return generate_auth_response(user) 


    def handle_42_oauth(self, code, state):
        school_oauth = School_OAuth(code=code, state=state)
        token = Tokens.objects.get(token=state)
        token.delete()

        students_data = school_oauth.getStudentsData()
        email = students_data.get('email')
        student = check_registration(email)
        if student:
            return generate_auth_response(student) 
        else:
            login = students_data.get('login')
            image_url = students_data.get('image', {}).get('link')
            filtered_data =  {'email': email, 'username': login, 'image_url': image_url}
            student = insert_user_in_db(filtered_data)
            is_sccuess  =  get_extern_image(student,filtered_data['image_url'])
            return generate_auth_response(student) 

    def post(self, request):
        try:
            is_valid = validate_request_data_register(request.data)
            if not is_valid:
                error = ErrorBuilder().set_type('Format_From_Front_End').set_message('Invalid arguments').build()
                return Response(error, status=status.HTTP_400_BAD_REQUEST)

            register_type = request.data['type']
            if register_type == 'normal':
                return self.normal_registration_type(request)
            elif (register_type == 'oauth'):
                state = request.data['data']['state']
                code = request.data['data']['code']
                token = Tokens.objects.filter(token=state).first()
                if not token:
                    error = ErrorBuilder().set_type('token').set_message('Invalid Token').build()
                    print(f'LoginView Error: {str(error)}')
                    return Response(error, status=status.HTTP_400_BAD_REQUEST)
                else :
                    type = token.type
                    if type and type == 'google_Oauth':
                        return self.handle_google_oauth(code, state)
                    elif type and type == '42_Oauth':
                        return self.handle_42_oauth(code, state)
                    else :
                        error = ErrorBuilder().set_type('token').set_message('Invalid OAuth Type').build()
                        print(f'LoginView Error: {str(error)}')
                        return Response(error, status=status.HTTP_400_BAD_REQUEST)
            else:
                error = ErrorBuilder().set_type('oauth').set_message('Undefined Authentication type').build()
                return Response(error, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error_message = str(e)  # Ensure the error message is a string
            errors = ErrorBuilder().set_type('').set_message(error_message).build()
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):

    def normal_login_type(self, request):
            input = request.data['data']['identity']['value']
            if not input :
                error = ErrorBuilder().set_type('').set_message('Empty Username').build()
                return Response(error, status=status.HTTP_400_BAD_REQUEST)        
            password = request.data['data']['password']
            user = CustomAuthenticationBackend().authenticate(request, username=input, password=password)

            if user is not None:
                login(request, user)
                auth_record = check_otp_is_enabled(user)
                if auth_record and auth_record.is_enabled is True:

                    token = generate_token_user(user)
                    otp_error =  send_otp(token, auth_record)
                    if otp_error !=  None: 
                            return Response(otp_error,status=404)

                    response = TwoFA_Builder().set_is_enabled('True').set_token(token.token).set_redirection('/2fa').build()
                    return Response(response, status=status.HTTP_200_OK)
                else:
                    redirection = request.data['refer']
                    if not redirection :
                        location = '/dashboard'
                    else:
                        location = redirection
                    return  generate_auth_response(user,location) 

            error = ErrorBuilder().set_type('').set_message('Invalid Username or Password').build()
            return Response(error, status=status.HTTP_400_BAD_REQUEST)


    def handle_42_oauth(self, code, state):
        school_oauth = School_OAuth(code=code, state=state)
        token = Tokens.objects.get(token=state)
        token.delete()

        students_data = school_oauth.getStudentsData()
        email = students_data.get('email')
        student = check_registration(email)
        if student:
            return generate_auth_response(student) 
        else:
            login = students_data.get('login')
            image_url = students_data.get('image', {}).get('link')
            filtered_data =  {'email': email, 'username': login, 'image_url': image_url}
            student = insert_user_in_db(filtered_data)
            is_sccuess  =  get_extern_image(student,filtered_data['image_url'])
            return generate_auth_response(student) 


    def handle_google_oauth(self, code, state):
        oauth = GoogleOAuth(code=code, state=state)
        token = Tokens.objects.get(token=state)
        token.delete()
        
        data = oauth.getUserData()
        user = check_registration(data['email'])
        if user != None :
            return generate_auth_response(user) 
        else:
            filtered_data = {'username': data['name'], 'email': data['email'], 'image_url': data['picture']}
            user = insert_user_in_db(filtered_data)
            is_sccuess  =  get_extern_image(user,filtered_data['image_url'])
            return generate_auth_response(user) 



    def post(self, request):
        try:
            is_valid = validate_request_data_login(request.data)
            if not is_valid:
                error = ErrorBuilder().set_type('Format_From_Front_End').set_message('Invalid arguments').build()
                return Response(error, status=status.HTTP_400_BAD_REQUEST)

            login_type = request.data['type']

            if (login_type == 'normal'):
                return self.normal_login_type(request)
            elif (login_type == 'oauth'):
                state = request.data['data']['state']
                code = request.data['data']['code']
                token = Tokens.objects.filter(token=state).first()
                if not token:
                    error = ErrorBuilder().set_type('token').set_message('Invalid Token').build()
                    print(f'LoginView Error: {str(error)}')
                    return Response(error, status=status.HTTP_400_BAD_REQUEST)
                else :
                    type = token.type
                    if type and type == 'google_Oauth':
                        response = self.handle_google_oauth(code, state)
                        return Response(response, status=status.HTTP_200_OK)
                    elif type and type == '42_Oauth':
                        response = self.handle_42_oauth(code, state)
                        return Response(response, status=status.HTTP_200_OK)
                    else :
                        error = ErrorBuilder().set_type('token').set_message('Invalid OAuth Type').build()
                        print(f'LoginView Error: {str(error)}')
                        return Response(error, status=status.HTTP_400_BAD_REQUEST)
            else:
                error = ErrorBuilder().set_type('oauth').set_message('Undefined Authentication type').build()
                return Response(error, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            if hasattr(e, 'detail'):
                error_message = e.detail
            else:
                error_message = str(e)
            errors = ErrorBuilder().set_type('').set_message(error_message).build()
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)


#! 2FA

class Check_2FAView(APIView):
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        print(f'REQUESSSSST ::: {request.data}')
        is_valid = validate_request_data_2fa(request.data)
        if not is_valid:
            error = ErrorBuilder().set_type('From Front-End').set_message('Invalid JSON Format').build()
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        token = request.data.get('token')
        other = request.data.get('otp')

        try :
            record = Tokens.objects.get(token=token)
            if record.other == other:
                record.delete()
                user = record.user_id
                redirection = request.data.get('refer')
                if not redirection:
                    location = '/dashboard'
                else:
                    location = redirection
                print(f'PAAAAAAASEEEEED |||||| {user} |||||||||||||')
                return generate_auth_response(user,location,False)
            else:
                error = ErrorBuilder().set_type('').set_message('Invalid Code').build()
                return Response(error, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            message = str(e)
            error = ErrorBuilder().set_type('').set_message(message).build()
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
    
##! Google_OAuth
class GoogleGenLink(APIView) :
    def get(self ,req):
        oauth = GoogleOAuth()
        link =  oauth.GenLink()
        response_link = {'link': link}
        return Response(response_link, status=status.HTTP_200_OK)

#! 42_OAuth
class GenerateLink42(APIView):
    def get(self, request):
        oauth_42 = School_OAuth()
        link = oauth_42.generate_link()
        response_link = {'link': link}
        return Response(response_link, status=status.HTTP_200_OK)


#! forget-password
class ForgetPasswordView(APIView):
    def check_email_in_db(self, email):
        if not email:
            return False
        exists = User.objects.filter(email=email).first()
        return exists

    def post(self, request):

        is_valid = validate_request_data_forget_pwd(request.data)
        if not is_valid:
            error = ErrorBuilder().set_type('From Front-End').set_message('Invalid JSON Format').build()
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        try: 
            email = request.data['email']
            email_in_db = self.check_email_in_db(email)

            if not email_in_db:
                message = ErrorBuilder().set_type('email_not_found').set_message('Not Found').build()
                return Response(message, status=status.HTTP_400_BAD_REQUEST)
            return self.generate_email_link(email)
        except Exception as e:
            error_message = e.detail
            errors = ErrorBuilder().set_type('').set_message(error_message).build()
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    def link_token_user(self, user):
        secret = secrets.token_hex(12)
        record = Tokens.objects.create()
        record.token = secret
        record.type = 'password'
        record.user_id = user
        record.save()
        return record

    def generate_email_link(self, email):
    #* linked a token to the user who has forgotten his password
        user = User.objects.filter(email=email).first()
        token = self.link_token_user(user)
        link = self.generate_link(token)
        if link:
            message = Message_Builder().set_message('A link was sent to your email').set_redirection('/login').build()
            return Response(message, status=status.HTTP_200_OK)

            # location = {'Location': '/login'}
            # return Response(message, status=status.HTTP_301_MOVED_PERMANENTLY, headers=location)
        else:
            error = ErrorBuilder().set_type('generate-link').set_message('The Link is invalid').build()
            print(f'generate_email_link: {str(error)}')
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
    def generate_link(self, token):
        try:
            client_reset_url = getattr(settings, 'CLIENT_RESET_URL', None)
            if client_reset_url:
                link = f'{settings.BACKEND_URL}/forget-password?token={token.token}'
                subject = 'Reset Password for ft_transcendance Account'
                message = f'Click on the link below to be redirected for resetting your password : {link}'
                sender = settings.EMAIL_HOST_USER
                receiver = [token.user_id.email]
                html_content =  render_to_string('reset_pass.html',{'user':token.user_id.username, 'link':link})
                send_mail(subject, message, sender, receiver,html_message=html_content)
                return link
        except Exception as e:
            print(e)
            return None




#! update-password/
class UpdatePasswordView(APIView):

    def post(self, request):
        try:
            message  = "" 
            is_valid = validate_request_data_upgrade_pwd(request.data)
            if not is_valid:
                error = ErrorBuilder().set_type('From Front-End').set_message('Invalid JSON Format').build()
                return Response(error, status=status.HTTP_400_BAD_REQUEST)

            token = request.data['token']
            user = self.fetch_user_from_token(token)
            if user:
                password = request.data['data']['password']
                retype_password = request.data['data']['retype_password']

                if password and retype_password and password == retype_password:
                    self.reset_password_in_db(user, password)
                    token_record = Tokens.objects.get(token=token)
                    token_record.delete()
                    message = Message_Builder().set_message('Your password has been changed successfully').set_redirection('/login').build()
                    return Response(message, status=200)
                else :
                    error = ErrorBuilder().set_type('Unmatched_password').set_message("Passwords don't match").build()
                    return Response(error, status=status.HTTP_400_BAD_REQUEST)

            else :
                error = ErrorBuilder().set_type('reset_password').set_message('Error: Invalid Token/User').build()
        except Exception as e:
           error = ErrorBuilder().set_type('Invalid JWT').set_message(e.__str__()).build()
        return Response(error, status=status.HTTP_404_NOT_FOUND)

    def fetch_user_from_token(self, token):
        record = Tokens.objects.filter(token=token).first()
        if record is None:
            return None
        user = record.user_id
        return user


    def reset_password_in_db(self, user, password):
        user.set_password(password)
        user.save(update_fields=['password'])

# ----- here start all view create by alphaben 

class  Profile(APIView):
    permission_classes = [IsAuthenticated]

    def  get_game_settings(user):
        color = "#ffffff"
        try: 
            game_settings = GameSettings.objects.filter(user=user).first();
            return {
                "paddle" : game_settings.paddle,
                "ball" :   game_settings.ball,
                "background" :  game_settings.background 
                } 
        except Exception as ex:
            GameSettings.objects.create(user=user, paddle=color, ball=color, background=color).save() 

            return {
            "paddle" : color,
            "ball" : color,
            "background" : color 
            } 

    def get(self, req):
        user  = req.user 
        level_data = get_level(user) 
        tfa = {
        "type": "email",
        "content": "",
        "status":    False 
        } 
        game_settings = Profile.get_game_settings(user)
        try:
            tfa_obj = Auth.objects.get(user_id=user) 
            tfa['content'] = tfa_obj.content
            tfa['status'] = tfa_obj.is_enabled 
        except:
            tfa['content'] = ""

        data = {
            "username": user.username,
            "profile_image": f"{settings.BACKEND_URL}{user.avatar_link.url}",
            "online" : user_status.isUserOnline(username=user.username),
            "email": user.email,
            "tfa": tfa,
            "matches": {
            "total": user.total_matches,
            "wins": user.wins,
            "losses": user.losses
            },
            "level": level_data,
            "game_settings": game_settings
        }
        return Response(data)
        

class  Users(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, req, username):
        user  = req.user 
        target = None
        try:
            target = User.objects.get(username=username)
        except Exception as e :
            return USER_NOT_FOUND_RES
        relation = get_relation(user1=user, user2=target)
        if relation == UserRelation.BLOCKED:
             return USER_NOT_FOUND_RES
        if relation == UserRelation.BLOCKER:
            data = {
                "id": target.id,
                "username": target.username,
                "relation": relation,
                "profile_image": f"{settings.BACKEND_URL}/media/avatars/default.png",
                "online" : False,
                "matches": {
                "total":    0,
                "wins":     0,
                "losses":   0
                },
                "level": {
                        "name"     : "unknown",
                        "profile_image"    : f"{settings.BACKEND_URL}/media/levels/starter.svg",
                        "current"  : 0,
                        "progress" : 0
                         }
            }
            return Response(data)

        is_online = False 
        if relation == UserRelation.FRIEND:
                is_online = target.is_online   
        level_data = get_level(target) 
        data = {
            "id": target.id,
            "username": target.username,
            "relation": relation,
            "profile_image": f"{settings.BACKEND_URL}{target.avatar_link.url}",
            "online" : is_online,
             "matches": {
            "total":    target.total_matches,
            "wins":     target.wins,
            "losses":   target.losses
            },
            "level": level_data
        }
        return Response(data)
        

class  Matches(APIView) :
    permission_classes = [IsAuthenticated]

    def get_status_from_match(self, draw, user_goals, opponent_goals):
        if draw == True:
            return 'draw'
        return 'win' if user_goals > opponent_goals else 'lose'

    def make_match(self, match, username):
        user = ""
        opponent = ""
        if match.player1.username == username:
            user = {
                "username": match.player1.username,
                "goals": match.player1_goals
            }
            opponent = {
                "obj": match.player2,
                "username": match.player2.username,
                "goals": match.player2_goals
            }
        else :
            user = {
                "username": match.player2.username,
                "goals": match.player2_goals
            }
            opponent = {
                "obj": match.player1,
                "username": match.player1.username,
                "goals": match.player1_goals
            }
        rel = get_relation(user1=match.player1, user2=match.player2)
        if  rel == UserRelation.BLOCKED or  rel == UserRelation.BLOCKER:
            return { 
                "match_id": match.match_id,
                "status": self.get_status_from_match(match.is_draw, user['goals'], opponent['goals']) ,
                "goals": user['goals'], 
                "opponent":{
                    "username" : opponent['username'],
                    "goals": opponent['goals'],
                    "profile_image" :f"/media/avatars/default.png",
                    "profile" : f"/users/{opponent['username']}",
                    "level":  {
                        "name"     : "beginner",
                        "image"    : "",
                        "current"  : 0,
                        "progress" : 0
                    }
                }
            }
        else:
            return { 
                "match_id": match.match_id,
                "status": self.get_status_from_match(match.is_draw, user['goals'], opponent['goals']) ,
                "goals": user['goals'], 
                "opponent":{
                    "username" : opponent['username'],
                    "goals": opponent['goals'],
                    "profile_image" : f"{opponent['obj'].avatar_link.url}",
                    "profile" : f"/users/{opponent['username']}",
                    "level": get_level(opponent['obj']) 
                }
            }

    def get(self,req):
        user  = req.user 
        matches = Match.objects.filter(Q(player1=user) | Q(player2=user))
        data  = []
        for match in matches:
            data.insert(0,self.make_match(match=match, username=user.username))
            print(match)
        return Response(data[:10])

class UserMatches(APIView) :
    permission_classes = [IsAuthenticated]

    def get_status_from_match(self, draw, user_goals, opponent_goals):
        if draw == True:
            return 'draw'
        return 'win' if user_goals > opponent_goals else 'lose'

    def make_match(self ,match, username,user_visitor):
        user        = {}
        opponent    = {}

        if match.player1.username == username:
            user = {
                "username": match.player1.username,
                "goals": match.player1_goals
            }
            opponent = {
                "obj": match.player2,
                "username": match.player2.username,
                "goals": match.player2_goals
            }
        else :
            user = {
                "username": match.player2.username,
                "goals": match.player2_goals
            }
            opponent = {
                "obj": match.player1,
                "username": match.player1.username,
                "goals": match.player1_goals
            }
        rel = get_relation(user1=user_visitor, user2=opponent['obj'])
        if  rel == UserRelation.BLOCKED or  rel == UserRelation.BLOCKER:
            return { 
                "match_id": match.match_id,
                "status": self.get_status_from_match(match.is_draw, user['goals'], opponent['goals']) ,
                "goals": user['goals'],

                "opponent":{
                    "username" : opponent['username'],
                    "goals": opponent['goals'],
                    "profile_image" : f"/media/avatars/default.png",
                    "profile" : f"/users/{opponent['username']}",
                    "level": {
                        "name"     : "beginner",
                        "image"    : "",
                        "current"  : 0,
                        "progress" : 0
                }
                }
            }

        else: 
            return { 
                "match_id": match.match_id,
                "status": self.get_status_from_match(match.is_draw, user['goals'], opponent['goals']) ,
                "goals": user['goals'],

                "opponent":{
                    "username" : opponent['username'],
                    "goals": opponent['goals'],
                    "profile_image" : f"{opponent['obj'].avatar_link.url}",
                    "profile" : f"/users/{opponent['username']}",
                    "level": get_level(opponent['obj']) 
                }
            }
    
    @valid_params
    def get(self,req ,username):
        user = req.user 
        target = None
        try:
            target = User.objects.get(username=username)
        except Exception as e:
           return USER_NOT_FOUND_RES
        
        rel = get_relation(user1=user,user2=target)

        block_record = Blocked_Friend.objects.filter(Q(blocker=user) | Q(blocked=user))
        block_row  = None 
        for item in  block_record:
            if item.blocked == target or item.blocker == target:
                block_row  = item;
                break

        if  block_row != None:
            print(f"{block_row.blocked} {username}")
            if block_row.blocked == user: 
                return USER_NOT_FOUND_RES;
            else:
                return Response([])
    
        matches = Match.objects.filter(Q(player1=target) | Q(player2=target)).order_by('-date')
        matches = matches[req.start:req.end]
        data  = []
        for match in matches: 
            data.append(self.make_match(match=match, username=target.username,user_visitor=user))
            print(match.date)
        print(len(data))

        return Response(data)
    
class FriendsView(APIView):

    permission_classes = [IsAuthenticated]

    @valid_params 
    def get(self,req):
        user  = req.user
        
        records = Friend.objects.filter(Q(user1=user) | Q(user2=user))
        data  = []
        for item in records: 
            friend = None
            if item.user1 == user : 
                friend = item.user2
            else:
                friend = item.user1 
            if req.filter == None or  friend.username.find(req.filter) >  -1:
                data.append({"username" : friend.username,
                        "id":friend.id,
                        "profile_image" : f"{settings.BACKEND_URL}/{friend.avatar_link.url}",
                        "online" : True ,
                        "profile" : f"/users/{friend.username}",
                        "relation" : f"{UserRelation.FRIEND}",
                        "level" : get_level(friend)
                        })
        data = data[req.start : req.end]
        return Response(data)
    
class UserFriendsView(APIView):
    permission_classes = [IsAuthenticated]

    @valid_params 
    def get(self,req, username):
        user  = req.user
        target =  None
        print(username)
        try:
             target = User.objects.get(username=username)
        except Exception as ex:
          return USER_NOT_FOUND_RES
        relation = get_relation(user, target)
        if relation =='blocked' or relation == 'blocker':
            return Response([])
        records = Friend.objects.filter(Q(user1=target) | Q(user2=target))
        data  = []
        for item in records: 
            friend = None
            if item.user1 == target : 
                friend = item.user2
            else:
                friend = item.user1 
            if req.filter == None or  friend.username.find(req.filter) >  -1:
                user_relation =  get_relation(user1=user, user2=friend)
                if user_relation != UserRelation.BLOCKED:
                    data.append({"username" : friend.username,
                        "profile_image" : f"{settings.BACKEND_URL}/{friend.avatar_link.url}",
                        "online" : True ,
                        "profile" : f"/users/{friend.username}",
                        "relation" : user_relation
                        })
        data = data[req.start : req.end]
        return Response(data)

class BlockedUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    @valid_params 
    def get(self,req):
        user  = req.user
        records = Blocked_Friend.objects.filter(blocker=user)
        data  = []
        for item in records: 
            if req.filter == None or  item.blocked.username.find(req.filter) >  -1:
                data.append({
                            "username" : item.blocked.username,
                        "profile_image" : f"{settings.BACKEND_URL}/{item.blocked.avatar_link.url}",
                        "profile" : f"/users/{item.blocked.username}",
                        "relation" : f"{UserRelation.BLOCKER}"
                                })
        data = data[req.start:req.end]
        return Response(data)

class PendingUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    @valid_params 
    def get(self,req):
        user = req.user 
        records = Invitation.objects.filter(receiver=user)
        data  = []
        for item in records: 
            if req.filter == None or  item.sender.username.find(req.filter) >  -1:
                data.append({
                                "username" : item.sender.username,
                                "profile_image" : f"{settings.BACKEND_URL}/{item.sender.avatar_link.url}",
                                "profile" : f"/users/{item.sender.username}",
                                "relation" : f"{UserRelation.REC_REQ}"
                                })
        data = data[req.start : req.end]
        return Response(data)


class UserAvatarUpload(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]
    def post(self, req) :
        try:
            user  = req.user
            serializer = UserAvatarSerializer(instance=user, data=req.data)
            if serializer.is_valid():
                serializer.save()
                link = str(serializer.data["avatar_link"])
                return Response({"url" : f"{settings.BACKEND_URL}{link}"}, status=status.HTTP_200_OK)
        except:
               return Response({"error": "unexpected error"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": serializer.errors['avatar_link'][0]}, status=status.HTTP_400_BAD_REQUEST)


class NotificationView(APIView):
    permission_classes = [IsAuthenticated]
    @valid_params
    def get(self, req) :
        try:
            user  = req.user 
            notifications = Notification.objects.filter(user=user)
            notifications =  notifications[req.start : req.end]
            notifications_list = []
            for item in notifications:
            
                notifications_list.append({
                    "notification_id"   : str(item.id),                #  Use notification ID
                    "type"              : item.type,                   #  Notification type
                    "content"           : item.content,                #  Notification content
                    "read"              : item.status,                 #  Read status
                    "id"                : item.callback                #  Callback as ID
                })

            return Response(notifications_list, status=200)
        except:
                return INVALID_PARAMS_RES
    
class UserSearch(APIView):
    permission_classes = [IsAuthenticated]
    @valid_params
    def get(self,req):
        user  = req.user
        if not req.filter  : 
            return Response([])
        
        records = User.objects.filter(username__contains=req.filter)
        data  = []
        for user2 in records: 
                user_relation =  get_relation(user1=user, user2=user2)
                if user_relation != UserRelation.BLOCKED and user_relation != UserRelation.YOU:
                    data.append({"username" : user2.username,
                        "profile_image" : f"{settings.BACKEND_URL}/{user2.avatar_link.url}",
                        "online" : False ,
                        "profile" : f"/users/{user2.username}",
                        "relation" : user_relation
                        })
        data = data[req.start:req.end]
        return Response(data)   
     
