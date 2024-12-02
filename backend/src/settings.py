import hvac
import os

from pathlib import Path
from .logger import log
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: don't run with debug turned on in production!
IS_PRODUCTION =  bool(os.getenv("IS_PRODUCTION"))
DEBUG =  IS_PRODUCTION == True  

IS_PRODUCTION = True


load_dotenv()
client = hvac.Client(url=os.getenv("VAULT_ADDR"), token=os.getenv("VAULT_DEV_ROOT_TOKEN_ID"))

try:

    db_secrets = client.secrets.kv.v1.read_secret(path='db')['data']
    POSTGRES_DB = db_secrets['POSTGRES_DB']
    POSTGRES_USER = db_secrets['POSTGRES_USER']
    POSTGRES_PASSWORD = db_secrets['POSTGRES_PASSWORD']
    POSTGRES_HOST = db_secrets['POSTGRES_HOST']
    POSTGRES_PORT = db_secrets['POSTGRES_PORT']

    # Fetch settings secrets
    settings_secrets = client.secrets.kv.v1.read_secret(path='settings')['data']
    SECRET_KEY = settings_secrets['SECRET_KEY']
    DEBUG = settings_secrets['DEBUG']
    EMAIL_BACKEND = settings_secrets['EMAIL_BACKEND']
    EMAIL_HOST = settings_secrets['EMAIL_HOST']
    EMAIL_PORT = settings_secrets['EMAIL_PORT']
    EMAIL_USE_TLS = settings_secrets['EMAIL_USE_TLS']
    EMAIL_HOST_USER = settings_secrets['EMAIL_HOST_USER']
    EMAIL_HOST_PASSWORD = settings_secrets['EMAIL_HOST_PASSWORD']

    # Fetch oauth credentials
    oauth_secrets = client.secrets.kv.v1.read_secret(path='oauth')['data']
    CLIENT_ID_42 = oauth_secrets['CLIENT_ID_42']
    CLIENT_SECRET_42 = oauth_secrets['CLIENT_SECRET_42']
    CLIENT_ID_GOOGLE = oauth_secrets['CLIENT_ID_GOOGLE']
    CLIENT_SECRET_GOOGLE =  oauth_secrets['CLIENT_SECRET_GOOGLE']
except hvac.exceptions.InvalidRequest as e:
    print(f"Invalid Request: {e}")
except hvac.exceptions.Forbidden as e:
    print(f"Permission Denied: {e}")
except hvac.exceptions.InvalidRequest as e:
    print(f"Invalid Request: {e}")
except Exception as e:
    print(f"An error occurred: {e}")


ALLOWED_HOSTS = ['localhost','.1337.ma']

ASGI_APPLICATION = 'src.asgi.application'
WSGI_APPLICATION = 'src.wsgi.application'

# Application definition

INSTALLED_APPS = [
    'daphne',
    'channels', 
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'users.apps.UsersConfig',
    'social_django',
    'rest_framework.authtoken',
    'game'
]

#-------------< CHANNEL_LAYERS >-------------------

# Development
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# Production 
if IS_PRODUCTION:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [('redis', 6379)],
            },
        },
    }


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Note Must Be Some Hosts
 
CORS_ALLOWED_ORIGINS = [
    'https://localhost:5173','http://localhost:5173','http://localhost:5500',
    'http://0.0.0.0','https://localhost'
]

# Check this 
CSRF_TRUSTED_ORIGINS = [
    'https://localhost',
     'https://localhost:5173',
    'http://localhost',
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True


ROOT_URLCONF = 'src.urls'
TEMPLATE_DIR = os.path.join(BASE_DIR,'templates')
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [TEMPLATE_DIR],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'src.wsgi.application'
ASGI_APPLICATION = "src.asgi.application"

# Development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

if IS_PRODUCTION:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': POSTGRES_DB,           
            'USER': POSTGRES_USER,
            'PASSWORD': POSTGRES_PASSWORD,     
            'HOST': POSTGRES_HOST, 
            'PORT': POSTGRES_PORT,      
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


STATIC_URL = 'static/'


AUTHENTICATION_BACKENDS = [
    'users.backends.CustomAuthenticationBackend',
]


TOKEN_EXPIRATION = 60 # in minutes

CLIENT_RESET_URL = 'http://localhost:8000' # The link where the user will be redirected to from his Email

SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)


AUTH_PROFILE_MODULE = 'users.User'
AUTH_USER_MODEL = 'users.User'

from datetime import timedelta

SIMPLE_JWT = {
    "AUTH_COOKIE": "refresh_token",
    "AUTH_COOKIE_SECURE": False,
    "AUTH_COOKIE_HTTP_ONLY": True,
    "AUTH_COOKIE_SAMESITE": 'Lax',
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",

    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),

    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}

MEDIA_URL = '/media/'  
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')

BACKEND_URL  = "http://localhost:8000"

if IS_PRODUCTION:
    BACKEND_URL  = "https://localhost"
