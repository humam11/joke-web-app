import json
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .forms import ContentItemForm
from .models import Category, ContentItem, SavedJoke


JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Programming,Misc,Pun'
User = get_user_model()

DEMO_CONTENT_FEED = [
    {
        'id': 'demo-1',
        'title': 'Короткая шутка про разработчика',
        'category': 'programming',
        'content_type': 'joke',
        'body': 'Разработчик обещал исправить баг за пять минут. Через час он уже переписывал архитектуру.',
    },
    {
        'id': 'demo-2',
        'title': 'История из офиса',
        'category': 'stories',
        'content_type': 'story',
        'body': 'На планерке попросили придумать легкую задачу. Команда открыла backlog и замолчала.',
    },
    {
        'id': 'demo-3',
        'title': 'Шутка дня',
        'category': 'daily',
        'content_type': 'joke',
        'body': 'Самая стабильная часть проекта - папка с временными файлами.',
    },
]


def serialize_user(user):
    if not user.is_authenticated:
        return None

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }


def serialize_saved_joke(joke):
    return {
        'id': joke.id,
        'external_id': joke.external_id,
        'category': joke.category,
        'setup': joke.setup,
        'delivery': joke.delivery,
        'text': joke.text,
        'source': joke.source,
        'created_at': joke.created_at.isoformat(),
    }


def serialize_category(category):
    return {
        'id': category.id,
        'name': category.name,
        'slug': category.slug,
        'description': category.description,
    }


def serialize_content_item(item):
    return {
        'id': item.id,
        'title': item.title,
        'body': item.body,
        'content_type': item.content_type,
        'category': serialize_category(item.category) if item.category else None,
        'author_name': item.author_name,
        'is_published': item.is_published,
        'created_at': item.created_at.isoformat(),
        'updated_at': item.updated_at.isoformat(),
    }


def normalize_jokeapi_payload(payload):
    return {
        'external_id': str(payload.get('id', '')),
        'category': payload.get('category', ''),
        'setup': payload.get('setup', ''),
        'delivery': payload.get('delivery', ''),
        'text': payload.get('joke', ''),
        'source': 'jokeapi',
    }


@api_view(['GET'])
def index(request):
    return Response({
        'name': 'FunnyHub API',
        'status': 'running',
        'endpoints': {
            'health': '/api/health/',
            'auth_me': '/api/auth/me/',
            'auth_login': '/api/auth/login/',
            'auth_register': '/api/auth/register/',
            'auth_logout': '/api/auth/logout/',
            'random_joke': '/api/jokes/random/',
            'saved_jokes': '/api/jokes/saved/',
            'categories': '/api/categories/',
            'content': '/api/content/',
            'admin': '/admin/',
        },
    })


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'jokes-api'})


@api_view(['GET'])
def auth_me(request):
    return Response({'user': serialize_user(request.user)})


@csrf_exempt
@api_view(['POST'])
def auth_register(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    email = request.data.get('email', '').strip()

    if len(username) < 3 or len(password) < 6:
        return Response(
            {'detail': 'Username must be 3+ chars and password must be 6+ chars.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    login(request, user)
    return Response({'user': serialize_user(user)}, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['POST'])
def auth_login(request):
    user = authenticate(
        request,
        username=request.data.get('username', '').strip(),
        password=request.data.get('password', ''),
    )

    if user is None:
        return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

    login(request, user)
    return Response({'user': serialize_user(user)})


@csrf_exempt
def auth_logout(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed.'}, status=405)

    logout(request)
    return JsonResponse({'user': None})


@api_view(['GET'])
def random_joke(request):
    params = urlencode({
        'safe-mode': '',
        'lang': request.query_params.get('lang', 'en'),
    })
    url = f'{JOKE_API_URL}?{params}'

    try:
        with urlopen(url, timeout=8) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        return Response(
            {'detail': 'Could not fetch a joke right now.', 'error': str(error)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if payload.get('error'):
        return Response(
            {'detail': payload.get('message', 'Joke API returned an error.')},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(normalize_jokeapi_payload(payload))


@api_view(['GET', 'POST'])
def saved_jokes(request):
    if request.method == 'GET':
        jokes = SavedJoke.objects.all()[:20]
        return Response([serialize_saved_joke(joke) for joke in jokes])

    joke = SavedJoke.objects.create(
        external_id=str(request.data.get('external_id', '')),
        category=request.data.get('category', ''),
        setup=request.data.get('setup', ''),
        delivery=request.data.get('delivery', ''),
        text=request.data.get('text', ''),
        source=request.data.get('source', 'jokeapi'),
    )
    return Response(serialize_saved_joke(joke), status=status.HTTP_201_CREATED)


@api_view(['GET'])
def categories(request):
    category_list = Category.objects.all()
    return Response([serialize_category(category) for category in category_list])


@api_view(['GET', 'POST'])
def content_items(request):
    if request.method == 'GET':
        category = request.query_params.get('category')
        queryset = ContentItem.objects.filter(is_published=True).select_related('category')

        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)

        items = [serialize_content_item(item) for item in queryset[:50]]
        categories_list = list(Category.objects.values_list('slug', flat=True))

        if not items and not categories_list:
            items = DEMO_CONTENT_FEED
            categories_list = sorted({item['category'] for item in DEMO_CONTENT_FEED})

            if category and category != 'all':
                items = [item for item in items if item['category'] == category]

        return Response({'items': items, 'categories': categories_list})

    form = ContentItemForm(request.data)
    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    item = form.save()
    return Response(serialize_content_item(item), status=status.HTTP_201_CREATED)
