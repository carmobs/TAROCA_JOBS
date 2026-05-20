"""
Admin para Perfiles
"""
from django.contrib import admin
from .models import PerfilTrabajador, Portafolio


@admin.register(PerfilTrabajador)
class PerfilTrabajadorAdmin(admin.ModelAdmin):
    list_display = [
        'usuario', 'categoria', 'ubicacion', 'calificacion_promedio',
        'total_trabajos', 'disponible', 'identidad_verificada'
    ]
    list_filter = ['categoria', 'disponible', 'identidad_verificada', 'domicilio_verificado']
    search_fields = ['usuario__nombre', 'usuario__apellido', 'usuario__email', 'ubicacion']
    readonly_fields = ['calificacion_promedio', 'total_trabajos', 'total_resenas']


@admin.register(Portafolio)
class PortafolioAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'perfil', 'tipo_media', 'orden', 'created_at']
    list_filter = ['tipo_media', 'created_at']
    search_fields = ['titulo', 'descripcion', 'perfil__usuario__nombre']
