"""
Admin para Usuarios
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ['email', 'nombre', 'apellido', 'rol', 'is_verificado', 'is_active', 'fecha_registro']
    list_filter = ['rol', 'is_verificado', 'is_active', 'fecha_registro']
    search_fields = ['email', 'nombre', 'apellido']
    ordering = ['-fecha_registro']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('nombre', 'apellido', 'telefono')}),
        ('Permisos', {'fields': ('rol', 'is_active', 'is_staff', 'is_superuser', 'is_verificado')}),
        ('Fechas', {'fields': ('fecha_registro', 'ultimo_acceso')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nombre', 'apellido', 'password1', 'password2', 'rol'),
        }),
    )
