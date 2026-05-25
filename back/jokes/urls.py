from django.urls import path

from .views import admin_content_item_detail, admin_create_joke, admin_user_ban, admin_user_unban, admin_users
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
    path('admin/users/', admin_users, name='admin-users'),
    path('admin/users/<int:user_id>/ban/', admin_user_ban, name='admin-user-ban'),
    path('admin/users/<int:user_id>/unban/', admin_user_unban, name='admin-user-unban'),
    path('admin/jokes/', admin_create_joke, name='admin-create-joke'),
    path('admin/content/<int:content_id>/', admin_content_item_detail, name='admin-content-item-detail'),
    path('jokes/random/', random_joke, name='random-joke'),
    path('jokes/saved/', saved_jokes, name='saved-jokes'),
    path('categories/', categories, name='categories'),
    path('content/', content_items, name='content-items'),
    path('content/<int:content_id>/comments/', content_comments, name='content-comments'),
]
