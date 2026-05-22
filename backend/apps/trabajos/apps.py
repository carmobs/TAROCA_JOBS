from django.apps import AppConfig


class TrabajosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.trabajos'
    
    def ready(self):
        """Conectar signals cuando la app está lista"""
        from django.db.models.signals import post_save
        from .models import Cotizacion
        from apps.seguridad.mixins import generar_firma_automatica
        
        # Conectar signal para generar firmas automáticamente
        post_save.connect(generar_firma_automatica, sender=Cotizacion)
