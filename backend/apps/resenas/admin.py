"""
Admin para Reseñas
"""
from django.contrib import admin
from .models import Resena, VotoUtil


@admin.register(Resena)
class ResenaAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'cliente', 'trabajador', 'calificacion',
        'verificada', 'util_count', 'created_at'
    ]
    list_filter = ['calificacion', 'verificada', 'created_at']
    search_fields = [
        'cliente__nombre', 'cliente__email',
        'trabajador__usuario__nombre', 'titulo', 'comentario'
    ]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VotoUtil)
class VotoUtilAdmin(admin.ModelAdmin):
    list_display = ['id', 'resena', 'usuario', 'created_at']
    search_fields = ['usuario__nombre', 'usuario__email']
