"""
URL Configuration for Plataforma de Conexión Trabajadores
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Endpoints
    path('api/auth/', include('apps.autenticacion.urls')),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/perfiles/', include('apps.perfiles.urls')),
    path('api/busqueda/', include('apps.busqueda.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/resenas/', include('apps.resenas.urls')),
    path('api/suscripciones/', include('apps.suscripciones.urls')),
    path('api/notificaciones/', include('apps.notificaciones.urls')),
    path('api/trabajos/', include('apps.trabajos.urls')),
]

# Servir archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
