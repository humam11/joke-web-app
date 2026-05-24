from django.urls import path

from .views import auth_login, auth_logout, auth_me, auth_register
from .views import categories, content_comments, content_items
from .views import health_check, index, random_joke, saved_jokes

urlpatterns = [
    path('', index, name='api-index'),
    path('health/', health_check, name='health-check'),
    path('auth/me/', auth_me, name='auth-me'),
    path('auth/login/', auth_login, name='auth-login'),
    path('auth/logout/', auth_logout, name='auth-logout'),
    path('auth/register/', auth_register, name='auth-register'),
    path('jokes/random/', random_joke, name='random-joke'),
    path('jokes/saved/', saved_jokes, name='saved-jokes'),
    path('categories/', categories, name='categories'),
    path('content/', content_items, name='content-items'),
    path('content/<int:content_id>/comments/', content_comments, name='content-comments'),
]
