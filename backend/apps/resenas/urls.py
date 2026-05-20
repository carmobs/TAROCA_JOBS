"""
URLs para Reseñas
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResenaViewSet

router = DefaultRouter()
router.register(r'', ResenaViewSet, basename='resena')

urlpatterns = [
    path('', include(router.urls)),
]
