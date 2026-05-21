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
