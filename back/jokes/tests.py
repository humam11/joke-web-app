import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from .models import Category, ContentItem


User = get_user_model()


class AdminPanelApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin-password',
        )
        self.user = User.objects.create_user(
            username='reader',
            email='reader@example.com',
            password='reader-password',
        )
        self.category = Category.objects.create(name='Test', slug='test')

    def post_json(self, path, payload=None):
        return self.client.post(
            path,
            data=json.dumps(payload or {}),
            content_type='application/json',
        )

    def patch_json(self, path, payload=None):
        return self.client.patch(
            path,
            data=json.dumps(payload or {}),
            content_type='application/json',
        )

    def test_admin_can_ban_and_unban_user(self):
        self.client.force_login(self.admin)

        ban_response = self.post_json(f'/api/admin/users/{self.user.id}/ban/')
        self.assertEqual(ban_response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

        unban_response = self.post_json(f'/api/admin/users/{self.user.id}/unban/')
        self.assertEqual(unban_response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_banned_user_cannot_login(self):
        self.user.is_active = False
        self.user.save(update_fields=['is_active'])

        response = self.post_json('/api/auth/login/', {
            'username': 'reader',
            'password': 'reader-password',
        })

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()['detail'], 'вы в бане, не забудьте взять веник')

    def test_admin_can_create_joke_for_content_feed(self):
        self.client.force_login(self.admin)

        response = self.post_json('/api/admin/jokes/', {
            'category': self.category.id,
            'body': 'Новая шутка из панели администратора.',
        })

        self.assertEqual(response.status_code, 201)
        item = ContentItem.objects.get(body='Новая шутка из панели администратора.')
        self.assertEqual(item.content_type, ContentItem.TYPE_JOKE)
        self.assertEqual(item.category, self.category)
        self.assertTrue(item.is_published)

    def test_admin_can_edit_joke_text(self):
        self.client.force_login(self.admin)
        item = ContentItem.objects.create(
            title='Old joke',
            body='Старый текст шутки.',
            content_type=ContentItem.TYPE_JOKE,
            category=self.category,
        )

        response = self.patch_json(f'/api/admin/content/{item.id}/', {
            'body': 'Новый текст шутки.',
        })

        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.body, 'Новый текст шутки.')

    def test_admin_can_delete_joke(self):
        self.client.force_login(self.admin)
        item = ContentItem.objects.create(
            title='Deleted joke',
            body='Эта шутка будет удалена.',
            content_type=ContentItem.TYPE_JOKE,
            category=self.category,
        )

        response = self.client.delete(f'/api/admin/content/{item.id}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(ContentItem.objects.filter(id=item.id).exists())
