from django import forms

from .models import Comment, ContentItem


class ContentItemForm(forms.ModelForm):
    class Meta:
        model = ContentItem
        fields = ['title', 'body', 'content_type', 'category', 'author_name', 'is_published']


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['author_name', 'body']
