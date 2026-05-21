from django.contrib import admin

from .models import SavedJoke


@admin.register(SavedJoke)
class SavedJokeAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'source', 'created_at')
    list_filter = ('category', 'source', 'created_at')
    search_fields = ('text', 'setup', 'delivery')
