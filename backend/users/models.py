
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser
)
from django.core.validators import MaxValueValidator
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.db import models
import uuid

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, username, email, password):
        if not username:
            raise ValueError('Users must have a username')
        if not email:
            raise ValueError('Users must have an email')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(
            username=username,
            email=email,
            password=password
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

from django.core.validators import validate_email

class User(AbstractBaseUser):
    username = models.CharField(max_length=50, blank=True, unique=True,
        error_messages={
            'unique': 'A user with that username already exists',
        }
    )
    email = models.EmailField(max_length=255, blank=True, unique=True,
        validators=[validate_email],
        error_messages={
            'unique': 'A user with that email already exists',
        }
    )

    is_active = models.BooleanField(default=True)
    total_matches = models.IntegerField(default=0)
    is_admin = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    avatar_link = models.ImageField(upload_to='avatars', default='avatars/default.png')
    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin




class Auth(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auth')
    content = models.CharField(max_length=50, blank=True,unique=True)
    is_enabled = models.BooleanField(default=False)
    method = models.CharField(max_length=25,default='email')


def default_token_expiration():
    return timezone.now() + timedelta(minutes=settings.TOKEN_EXPIRATION)

class Tokens(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='token',blank=True, null=True)
    type = models.CharField(max_length=25)
    token = models.CharField(max_length=25)
    date = models.DateTimeField(auto_now_add=True)
    expired_date = models.DateTimeField(default=default_token_expiration)
    other = models.CharField(max_length=12, null=True)

    class Meta:
        verbose_name_plural = "Tokens"

    def __str__(self):
        return self.token

class Level(models.Model):
    level_no   =  models.IntegerField(default=0)
    name       =   models.CharField(max_length=30)
    image      =   models.CharField(max_length=255)
    
    def __str__(self):
        return self.name
    
class Blocked_Friend(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocker_friend')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_friend')

    def __str__(self):
        return f'{self.blocker} -> {self.blocked}'
    
class Invitation(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender_invitations')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver_invitations')

    def __str__(self):
        return f'{self.sender} -> {self.receiver}'
    

class Conversation(models.Model):
    thread_name = models.CharField(max_length=50,  null=False, blank=False)
    last_message = models.TextField(blank=False, null=False, max_length=500)
    timestamp = models.DateTimeField(null=True, blank=True)
    status = models.BooleanField(default=False)
    last_date = models.DateTimeField(auto_now=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conv_sender')
    receiver = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='conv_receiver')

    def __str__(self):
        return f'{self.sender} : {self.thread_name}'

class Message(models.Model):
    thread_name = models.CharField(max_length=50, null=True, blank=True)
    conversation_id = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='id_message')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender_message')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver_message', default=1)
    status = models.BooleanField(default=False)
    content = models.TextField(blank=False, null=False, max_length=500)
    message_type = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender} -> {self.receiver} | -->>Time: {self.date}'


class Friend(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_friend')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_friend')
    conversation_id = models.ForeignKey(Conversation, on_delete=models.CASCADE,null=True, related_name='conversation_id_friend')

    def __str__(self):
        return f'{self.user1} <-> {self.user2}'

class Match(models.Model):
    time = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)
    winner = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='winner_match')
    is_draw = models.BooleanField(default=False)
    player1 = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='player1_match')
    player2 = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='player2_match')
    player1_goals = models.PositiveIntegerField(validators=[MaxValueValidator(10)])
    player2_goals = models.PositiveIntegerField(validators=[MaxValueValidator(10)])
    match_id = models.UUIDField(primary_key=True)


    class Meta:
        verbose_name_plural = "Matches"

    def __str__(self):
        return f'{self.player1} VS {self.player2} date {self.date}'


def default_expire_date():
    return timezone.now() + timedelta(hours=24)

class MatchInvitation(models.Model):
    expire_date = models.DateTimeField(default=default_expire_date)
    match_id    = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    sender      = models.ForeignKey(User, related_name='sent_invitations', on_delete=models.CASCADE)
    receiver    = models.ForeignKey(User, related_name='received_invitations', on_delete=models.CASCADE)
    date_sent   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invitation to match {self.match_id} from {self.sender} to {self.receiver}"

    class Meta:
        unique_together = ('match_id', 'sender', 'receiver')

class Notification(models.Model):

    content     =   models.TextField()
    type        =   models.CharField(max_length=50)
    status      =   models.BooleanField(default=False)
    callback    =   models.CharField(max_length=255, null=True, blank=True)
    date        =   models.DateTimeField(auto_now_add=True) 
    user        =   models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.content}..."

    class Meta:
        ordering = ['-date']


class GameSettings(models.Model):
    color_validator= RegexValidator(
        regex=r'^#[0-9A-Fa-f]{6}$',
        message="Color must be in the format #rrggbb."
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='game_settings'
    )
    paddle = models.CharField(
        max_length=7,
        validators=[color_validator]
    )
    ball = models.CharField(
        max_length=7,
        validators=[color_validator],
    )

    background = models.CharField(
        max_length=7,
        validators=[color_validator]
    )
    
    def __str__(self):
        return f"GameSettings(user={self.user.username}, paddle={self.paddle}, ball={self.ball}, background={self.background})"
