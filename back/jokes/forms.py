from django import forms

from .models import ContentItem


class ContentItemForm(forms.ModelForm):
    class Meta:
        model = ContentItem
        fields = ['title', 'body', 'content_type', 'category', 'author_name', 'is_published']
