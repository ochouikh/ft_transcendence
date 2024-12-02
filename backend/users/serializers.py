from rest_framework import serializers
from .models import User, Tokens, Message, Conversation, Friend , GameSettings

from rest_framework.validators import UniqueValidator
from django.core.validators import RegexValidator
from datetime import timedelta


class RegistrationSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        error_messages={
            'blank': 'Username field should not be blank'
        },
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message='A user with that username already exists '
            ),
            RegexValidator(
                regex=r'^[a-z][\w-]{2,15}[a-z\d]$',
                message='Valid Characters are : [a-z] and [A-Z] & Length must be between 3 and 16 characters long',
                code='invalid_username'
            )
        ]
    )

    email = serializers.EmailField(
        error_messages={
            'blank': 'Email field should not be blank ',
            'invalid': 'Enter a valid email address '
        },
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message='A user with that email already exists '
            )
        ]
    )

    password = serializers.CharField(
        style={"input_type": "password"},
        write_only=True,
        error_messages={'blank': 'Password field should not be blank'},
        validators=[
            RegexValidator(
                regex=r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$',
                message='Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one number.'
            )
        ]
    )

    retype_password = serializers.CharField(
        style={"input_type": "password"},
        write_only=True,
        error_messages={'blank': 'Retype-Password field should not be blank'}
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'retype_password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        errors = {}
        password = data.get('password')
        retype_password = data.get('retype_password')

        if password and retype_password and password != retype_password:
            errors['password'] = "Passwords don't match"
            raise serializers.ValidationError(errors)
        return data

    def save(self):
        user = User (
            username=self.validated_data['username'],
            email=self.validated_data['email'],
        )
        user.set_password(self.validated_data['password'])
        user.save()
        return user

from django.db import IntegrityError

class OAuthRegistratinSerialize(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['username', 'email']

    def save(self):
        try:
            user = User.objects.create(
                username=self.validated_data['username'].lower(),
                email=self.validated_data['email'].lower()
            )
            user.save()
            return user
        except IntegrityError:
            return None

class OAuthRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        error_messages={
            'blank': 'Username field should not be blank'
        },
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message='A user with that username already exists '
            ),
            RegexValidator(
                regex=r'^[a-z][\w-]{2,15}[a-z\d]$',
                message='Valid Characters are : [a-z][\w-][a-z\d] & Length must be between 3 and 16 characters long',
                code='invalid_username'
            )
        ]
    )

    class Meta:
        model = User
        fields = ['username']

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.save()
        return instance

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username', read_only=True)
    receiver = serializers.CharField(source='receiver.username', read_only=True)
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'date']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if 'date' in representation:
            original_date = instance.date
            new_date = original_date + timedelta(hours=1)
            representation['date'] = new_date.strftime("%Y-%m-%d %H:%M:%S")
        return representation

class ConversationSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username', read_only=True)
    last_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    # online = serializers.CharField(source='sender.is_online', read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'last_message', 'status', 'last_date', 'sender']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if 'last_date' in representation:
            original_date = instance.last_date
            new_date = original_date + timedelta(hours=1)
            representation['last_date'] = new_date.strftime("%Y-%m-%d %H:%M:%S")
        return representation


from src import settings
BACKEND_URL = settings.BACKEND_URL

class ConvFriendsSerializer(serializers.ModelSerializer):

    avatar_link = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_link', 'is_online']

    def get_avatar_link(self, object):
        return f"{BACKEND_URL}/{object.avatar_link.url}"


def get_conversation_id(obj):
    return obj.conversation_id.id

class FriendsSerializer(serializers.ModelSerializer):
    search_friend = serializers.SerializerMethodField()

    class Meta:
        model = Friend
        fields = ['search_friend']

    def get_search_friend(self, obj):
        current_user = self.context['current_user']
        search_friend = obj.user1 if obj.user2 == current_user else obj.user2
        friend_data = ConvFriendsSerializer(search_friend).data
        friend_data['conversation_id'] = get_conversation_id(obj)
        return friend_data

class OnlineSerializer(serializers.ModelSerializer):

    avatar_link = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_link', 'is_online']

    def get_avatar_link(self, object):
        return f"{BACKEND_URL}/{object.avatar_link.url}"
    

from rest_framework import serializers
from PIL import Image  
from .models import User 


class UserAvatarSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id','avatar_link',)

    def update(self, instance, validated_data):
        avatar = validated_data.get('avatar_link', instance.avatar_link)
        instance.avatar_link = avatar
        instance.avatar_link.name=f"{instance.username}.png"
        print(f"Save avatar path => {instance.avatar_link.path}")
        instance.save(update_fields=['avatar_link'])
        self.resize_image(instance.avatar_link.path, (250, 250)) 
        return instance

    def resize_image(self, image_path, size):
        try:
            img = Image.open(image_path)
            img = img.resize(size)
            img.save(image_path)
        except IOError:
            print(f"Cannot resize image at {image_path} IOError.")
        except Exception as e:
            print(f"An error occurred while resizing image at {image_path}: {str(e)}")

#####################

from rest_framework.serializers import Serializer 
from rest_framework import serializers

class SystemSocketSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=50)
    identifier = serializers.CharField(max_length=50)

    def validate(self, attrs):
        if 'type' not in attrs or not attrs['type']:
            raise serializers.ValidationError("The 'type' field is required.")
        if 'identifier' not in attrs or not attrs['identifier']:
            raise serializers.ValidationError("The 'identifier' field is required.")
        
        return attrs

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSettings
        fields = ['paddle', 'ball', 'background']
