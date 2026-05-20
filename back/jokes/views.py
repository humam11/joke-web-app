import json
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response

from .models import SavedJoke


JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Programming,Misc,Pun'

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
            'random_joke': '/api/jokes/random/',
            'saved_jokes': '/api/jokes/saved/',
            'content_feed': '/api/content/',
            'admin': '/admin/',
        },
    })


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'jokes-api'})


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
def content_feed(request):
    category = request.query_params.get('category')

    if category and category != 'all':
        items = [item for item in CONTENT_FEED if item['category'] == category]
    else:
        items = CONTENT_FEED

    categories = sorted({item['category'] for item in CONTENT_FEED})
    return Response({'items': items, 'categories': categories})
