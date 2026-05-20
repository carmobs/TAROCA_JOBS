from django.contrib import admin
from .models import Trabajo, Cotizacion


@admin.register(Trabajo)
class TrabajoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'cliente', 'categoria', 'estado', 'created_at']
    list_filter = ['estado', 'categoria', 'created_at']
    search_fields = ['titulo', 'descripcion', 'cliente__nombre']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    list_display = ['trabajo', 'trabajador', 'precio', 'estado', 'created_at']
    list_filter = ['estado', 'created_at']
    search_fields = ['trabajo__titulo', 'trabajador__usuario__nombre']
    readonly_fields = ['created_at', 'updated_at']
