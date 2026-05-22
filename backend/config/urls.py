"""
URL Configuration for Plataforma de Conexión Trabajadores
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
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

    # Compatibilidad con clientes desplegados que consumen las rutas sin /api
    path('auth/', include('apps.autenticacion.urls')),
    path('usuarios/', include('apps.usuarios.urls')),
    path('perfiles/', include('apps.perfiles.urls')),
    path('busqueda/', include('apps.busqueda.urls')),
    path('chat/', include('apps.chat.urls')),
    path('resenas/', include('apps.resenas.urls')),
    path('suscripciones/', include('apps.suscripciones.urls')),
    path('notificaciones/', include('apps.notificaciones.urls')),
    path('trabajos/', include('apps.trabajos.urls')),
]

# Servir media en cualquier entorno para que los uploads sean accesibles
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
