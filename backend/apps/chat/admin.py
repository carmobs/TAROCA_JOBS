"""
Admin para Chat
"""
from django.contrib import admin
from .models import Conversacion, Mensaje


@admin.register(Conversacion)
class ConversacionAdmin(admin.ModelAdmin):
    list_display = ['id', 'participante_1', 'participante_2', 'activa', 'created_at', 'updated_at']
    list_filter = ['activa', 'created_at']
    search_fields = [
        'participante_1__nombre', 'participante_1__email',
        'participante_2__nombre', 'participante_2__email'
    ]


@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversacion', 'remitente', 'contenido', 'leido', 'created_at']
    list_filter = ['leido', 'created_at']
    search_fields = ['remitente__nombre', 'remitente__email', 'contenido']
    readonly_fields = ['created_at']
