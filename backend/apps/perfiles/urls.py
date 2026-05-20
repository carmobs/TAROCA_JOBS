"""
URLs para Perfiles
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerfilTrabajadorViewSet, PortafolioViewSet

router = DefaultRouter()
router.register(r'trabajadores', PerfilTrabajadorViewSet, basename='perfil-trabajador')
router.register(r'portafolios', PortafolioViewSet, basename='portafolio')

urlpatterns = [
    path('', include(router.urls)),
]
