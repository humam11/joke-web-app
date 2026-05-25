import json
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response

from .forms import CommentForm, ContentItemForm
from .models import Category, Comment, ContentItem, SavedJoke


JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Programming,Misc,Pun'
User = get_user_model()


def serialize_user(user):
    if not user.is_authenticated:
        return None

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }

CONTENT_FEED = [
    {
        'id': 1,
        'title': 'Короткая шутка про разработчика',
        'category': 'programming',
        'type': 'joke',
        'body': 'Разработчик обещал исправить баг за пять минут. Через час он уже переписывал архитектуру.',
    },
    {
        'id': 2,
        'title': 'История из офиса',
        'category': 'stories',
        'type': 'story',
        'body': 'На планерке попросили придумать легкую задачу. Команда дружно открыла backlog и замолчала.',
    },
    {
        'id': 3,
        'title': 'Шутка дня',
        'category': 'daily',
        'type': 'joke',
        'body': 'Самая стабильная часть проекта — папка с временными файлами.',
    },
]


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
        'comments_count': item.comments.filter(is_visible=True).count(),
    }


def serialize_comment(comment):
    author_name = comment.user.username if comment.user else comment.author_name

    return {
        'id': comment.id,
        'content_item': comment.content_item_id,
        'author_name': author_name or 'Гость',
        'body': comment.body,
        'created_at': comment.created_at.isoformat(),
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
            'comments': '/api/content/{id}/comments/',
            'admin': '/admin/',
        },
    })


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'jokes-api'})


@api_view(['GET'])
@ensure_csrf_cookie
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
@api_view(['POST'])
def auth_logout(request):
    logout(request)
    return Response({'user': None})


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
        items = ContentItem.objects.filter(is_published=True).select_related('category')
        category = request.query_params.get('category')

        if category and category != 'all':
            items = items.filter(category__slug=category)

        item_list = list(items[:50])
        category_list = Category.objects.all()
        return Response({
            'items': [serialize_content_item(item) for item in item_list],
            'categories': [serialize_category(category) for category in category_list],
        })

    form = ContentItemForm(request.data)
    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    item = form.save()
    return Response(serialize_content_item(item), status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def content_comments(request, content_id):
    try:
        content_item = ContentItem.objects.get(pk=content_id, is_published=True)
    except ContentItem.DoesNotExist:
        return Response({'detail': 'Content item not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = content_item.comments.filter(is_visible=True).select_related('user')[:50]
        return Response({'comments': [serialize_comment(comment) for comment in comments]})

    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication is required to add comments.'}, status=status.HTTP_401_UNAUTHORIZED)

    form = CommentForm(request.data)
    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    comment = form.save(commit=False)
    comment.content_item = content_item

    if request.user.is_authenticated:
        comment.user = request.user
        comment.author_name = request.user.username
    elif not comment.author_name.strip():
        comment.author_name = 'Гость'

    comment.save()
    return Response(serialize_comment(comment), status=status.HTTP_201_CREATED)

def content_feed(request):
    category = request.query_params.get('category')

    if category and category != 'all':
        items = [item for item in CONTENT_FEED if item['category'] == category]
    else:
        items = CONTENT_FEED

    categories = sorted({item['category'] for item in CONTENT_FEED})
    return Response({'items': items, 'categories': categories})

