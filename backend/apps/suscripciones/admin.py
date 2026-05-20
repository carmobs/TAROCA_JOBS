"""
Admin para Suscripciones
"""
from django.contrib import admin
from .models import PlanSuscripcion, Suscripcion, Transaccion


@admin.register(PlanSuscripcion)
class PlanSuscripcionAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'precio', 'periodo', 'activo', 'orden']
    list_filter = ['periodo', 'activo']
    search_fields = ['nombre', 'descripcion']


@admin.register(Suscripcion)
class SuscripcionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'usuario', 'plan', 'fecha_inicio', 'fecha_fin',
        'estado', 'renovacion_automatica'
    ]
    list_filter = ['estado', 'renovacion_automatica', 'plan']
    search_fields = ['usuario__nombre', 'usuario__email']
    date_hierarchy = 'fecha_inicio'


@admin.register(Transaccion)
class TransaccionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'usuario', 'suscripcion', 'monto', 'estado',
        'metodo_pago', 'created_at'
    ]
    list_filter = ['estado', 'metodo_pago', 'created_at']
    search_fields = ['usuario__nombre', 'usuario__email', 'referencia_pago']
    readonly_fields = ['created_at', 'updated_at']
