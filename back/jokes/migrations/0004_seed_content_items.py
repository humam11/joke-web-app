from django.db import migrations


SEED_CONTENT = [
    {
        'category': {
            'name': 'Programming',
            'slug': 'programming',
            'description': 'Шутки и истории про разработку',
        },
        'item': {
            'title': 'Короткая шутка про разработчика',
            'body': 'Разработчик обещал исправить баг за пять минут. Через час он уже переписывал архитектуру.',
            'content_type': 'joke',
            'author_name': 'FunnyHub',
        },
    },
    {
        'category': {
            'name': 'Stories',
            'slug': 'stories',
            'description': 'Офисные и жизненные истории',
        },
        'item': {
            'title': 'История из офиса',
            'body': 'На планерке попросили придумать легкую задачу. Команда дружно открыла backlog и замолчала.',
            'content_type': 'story',
            'author_name': 'FunnyHub',
        },
    },
    {
        'category': {
            'name': 'Daily',
            'slug': 'daily',
            'description': 'Шутка дня и короткие заметки',
        },
        'item': {
            'title': 'Шутка дня',
            'body': 'Самая стабильная часть проекта - папка с временными файлами.',
            'content_type': 'joke',
            'author_name': 'FunnyHub',
        },
    },
]


def seed_content(apps, schema_editor):
    Category = apps.get_model('jokes', 'Category')
    ContentItem = apps.get_model('jokes', 'ContentItem')

    for entry in SEED_CONTENT:
        category, _ = Category.objects.get_or_create(
            slug=entry['category']['slug'],
            defaults={
                'name': entry['category']['name'],
                'description': entry['category']['description'],
            },
        )

        ContentItem.objects.get_or_create(
            title=entry['item']['title'],
            defaults={
                'body': entry['item']['body'],
                'content_type': entry['item']['content_type'],
                'category': category,
                'author_name': entry['item']['author_name'],
                'is_published': True,
            },
        )


def unseed_content(apps, schema_editor):
    ContentItem = apps.get_model('jokes', 'ContentItem')
    Category = apps.get_model('jokes', 'Category')

    ContentItem.objects.filter(title__in=[entry['item']['title'] for entry in SEED_CONTENT]).delete()
    Category.objects.filter(slug__in=[entry['category']['slug'] for entry in SEED_CONTENT]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('jokes', '0003_comment'),
    ]

    operations = [
        migrations.RunPython(seed_content, unseed_content),
    ]
