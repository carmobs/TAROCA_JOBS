"""
Modelos de Chat
Los mensajes se almacenarán en MongoDB para mejor rendimiento
"""
from django.db import models
from apps.usuarios.models import Usuario


class Conversacion(models.Model):
    """
    Conversación entre dos usuarios
    """
    participante_1 = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='conversaciones_iniciadas'
    )
    participante_2 = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='conversaciones_recibidas'
    )
    
    activa = models.BooleanField(default=True, verbose_name='Activa')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'conversaciones'
        verbose_name = 'Conversación'
        verbose_name_plural = 'Conversaciones'
        unique_together = ['participante_1', 'participante_2']
        indexes = [
            models.Index(fields=['participante_1', 'participante_2']),
            models.Index(fields=['-updated_at']),
        ]
    
    def __str__(self):
        return f"Chat: {self.participante_1} - {self.participante_2}"
    
    @classmethod
    def obtener_o_crear(cls, usuario1, usuario2):
        """Obtener conversación existente o crear una nueva"""
        # Asegurar orden consistente de participantes
        if usuario1.id > usuario2.id:
            usuario1, usuario2 = usuario2, usuario1
        
        conversacion, created = cls.objects.get_or_create(
            participante_1=usuario1,
            participante_2=usuario2
        )
        return conversacion


class Mensaje(models.Model):
    """
    Mensajes individuales en una conversación
    Nota: En producción, estos se almacenarían en MongoDB
    """
    conversacion = models.ForeignKey(
        Conversacion,
        on_delete=models.CASCADE,
        related_name='mensajes'
    )
    remitente = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    
    contenido = models.TextField(verbose_name='Contenido')
    leido = models.BooleanField(default=False, verbose_name='Leído')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mensajes'
        verbose_name = 'Mensaje'
        verbose_name_plural = 'Mensajes'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversacion', 'created_at']),
            models.Index(fields=['leido']),
        ]
    
    def __str__(self):
        return f"Mensaje de {self.remitente} en {self.conversacion}"
