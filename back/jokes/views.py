from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def index(request):
    return Response({
        'name': 'FunnyHub API',
        'status': 'running',
        'endpoints': {
            'health': '/api/health/',
            'admin': '/admin/',
        },
    })


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'jokes-api'})
