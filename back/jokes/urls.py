from django.urls import path

from .views import auth_login, auth_logout, auth_me, auth_register, health_check, random_joke, saved_jokes

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('auth/me/', auth_me, name='auth-me'),
    path('auth/login/', auth_login, name='auth-login'),
    path('auth/logout/', auth_logout, name='auth-logout'),
    path('auth/register/', auth_register, name='auth-register'),
    path('jokes/random/', random_joke, name='random-joke'),
    path('jokes/saved/', saved_jokes, name='saved-jokes'),
]
