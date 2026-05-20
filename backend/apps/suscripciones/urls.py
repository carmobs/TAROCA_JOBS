"""
URLs para Suscripciones
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanSuscripcionViewSet, SuscripcionViewSet, TransaccionViewSet

router = DefaultRouter()
router.register(r'planes', PlanSuscripcionViewSet, basename='plan')
router.register(r'', SuscripcionViewSet, basename='suscripcion')
router.register(r'transacciones', TransaccionViewSet, basename='transaccion')

urlpatterns = [
    path('', include(router.urls)),
]
