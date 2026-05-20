from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrabajoViewSet, CotizacionViewSet

router = DefaultRouter()
router.register(r'trabajos', TrabajoViewSet, basename='trabajo')
router.register(r'cotizaciones', CotizacionViewSet, basename='cotizacion')

app_name = 'trabajos'

urlpatterns = [
    path('', include(router.urls)),
]
