from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SavedJoke',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('external_id', models.CharField(blank=True, max_length=64)),
                ('category', models.CharField(blank=True, max_length=50)),
                ('setup', models.TextField(blank=True)),
                ('delivery', models.TextField(blank=True)),
                ('text', models.TextField(blank=True)),
                ('source', models.CharField(default='jokeapi', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
