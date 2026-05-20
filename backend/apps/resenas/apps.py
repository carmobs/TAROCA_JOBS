"""
App de Reseñas - Sistema de calificaciones verificadas
"""
from django.apps import AppConfig


class ResenasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.resenas'
    verbose_name = 'Reseñas'
