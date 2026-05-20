from django.urls import path

from .views import content_feed, health_check, random_joke, saved_jokes

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('content/', content_feed, name='content-feed'),
    path('jokes/random/', random_joke, name='random-joke'),
    path('jokes/saved/', saved_jokes, name='saved-jokes'),
]
