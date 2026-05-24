from django.contrib import admin

from .models import Category, Comment, ContentItem, SavedJoke


@admin.register(SavedJoke)
class SavedJokeAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'source', 'created_at')
    list_filter = ('category', 'source', 'created_at')
    search_fields = ('text', 'setup', 'delivery')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')


@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'category', 'is_published', 'created_at')
    list_filter = ('content_type', 'category', 'is_published', 'created_at')
    search_fields = ('title', 'body', 'author_name')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('content_item', 'author_name', 'user', 'is_visible', 'created_at')
    list_filter = ('is_visible', 'created_at')
    search_fields = ('body', 'author_name', 'user__username', 'content_item__title')
