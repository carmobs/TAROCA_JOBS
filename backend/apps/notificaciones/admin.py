"""
Admin para Notificaciones
"""
from django.contrib import admin
from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'tipo', 'titulo', 'leida', 'created_at']
    list_filter = ['tipo', 'leida', 'created_at']
    search_fields = ['usuario__nombre', 'usuario__email', 'titulo', 'mensaje']
    readonly_fields = ['created_at']
