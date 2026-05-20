from django.urls import path

from .views import health_check, random_joke, saved_jokes

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('jokes/random/', random_joke, name='random-joke'),
    path('jokes/saved/', saved_jokes, name='saved-jokes'),
]
