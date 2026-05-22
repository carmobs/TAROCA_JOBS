"""
App de Reseñas - Sistema de calificaciones verificadas
"""
from django.apps import AppConfig


class ResenasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.resenas'
    verbose_name = 'Reseñas'
    
    def ready(self):
        """Conectar signals cuando la app está lista"""
        from django.db.models.signals import post_save
        from .models import Resena
        from apps.seguridad.mixins import generar_firma_automatica
        
        # Conectar signal para generar firmas automáticamente
        post_save.connect(generar_firma_automatica, sender=Resena)
