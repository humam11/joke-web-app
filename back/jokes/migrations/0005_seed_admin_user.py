from django.contrib.auth.hashers import make_password
from django.db import migrations


ADMIN_USERNAME = 'funnyadmin'
ADMIN_EMAIL = 'funnyadmin@example.com'
ADMIN_PASSWORD = 'AdminPanel2026!'


def seed_admin_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')

    user, created = User.objects.get_or_create(
        username=ADMIN_USERNAME,
        defaults={
            'email': ADMIN_EMAIL,
            'password': make_password(ADMIN_PASSWORD),
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        },
    )

    if not created:
        user.email = ADMIN_EMAIL
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.password = make_password(ADMIN_PASSWORD)
        user.save(update_fields=['email', 'password', 'is_staff', 'is_superuser', 'is_active'])


def unseed_admin_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(username=ADMIN_USERNAME, email=ADMIN_EMAIL).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('jokes', '0004_seed_content_items'),
    ]

    operations = [
        migrations.RunPython(seed_admin_user, unseed_admin_user),
    ]
