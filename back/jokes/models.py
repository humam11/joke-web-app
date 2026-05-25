from django.db import models


class SavedJoke(models.Model):
    external_id = models.CharField(max_length=64, blank=True)
    category = models.CharField(max_length=50, blank=True)
    setup = models.TextField(blank=True)
    delivery = models.TextField(blank=True)
    text = models.TextField(blank=True)
    source = models.CharField(max_length=50, default='jokeapi')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.text or self.setup or f'Joke #{self.pk}'


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class ContentItem(models.Model):
    TYPE_JOKE = 'joke'
    TYPE_STORY = 'story'
    TYPE_MEME = 'meme'

    CONTENT_TYPES = [
        (TYPE_JOKE, 'Joke'),
        (TYPE_STORY, 'Story'),
        (TYPE_MEME, 'Meme'),
    ]

    title = models.CharField(max_length=140)
    body = models.TextField()
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, default=TYPE_JOKE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    author_name = models.CharField(max_length=80, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Comment(models.Model):
    content_item = models.ForeignKey(ContentItem, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='comments')
    author_name = models.CharField(max_length=80, blank=True)
    body = models.TextField(max_length=1000)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        author = self.user.username if self.user else self.author_name or 'Guest'
        return f'{author}: {self.body[:40]}'
