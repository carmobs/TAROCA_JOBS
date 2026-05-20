"""
Modelos de Notificaciones
En producción, se almacenarían en MongoDB
"""
from django.db import models
from apps.usuarios.models import Usuario


class Notificacion(models.Model):
    """
    Notificaciones para usuarios
    """
    
    TIPOS = (
        ('mensaje', 'Nuevo Mensaje'),
        ('resena', 'Nueva Reseña'),
        ('trabajo', 'Nuevo Trabajo'),
        ('pago', 'Pago Recibido'),
        ('sistema', 'Notificación del Sistema'),
    )
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    
    tipo = models.CharField(max_length=20, choices=TIPOS, verbose_name='Tipo')
    titulo = models.CharField(max_length=200, verbose_name='Título')
    mensaje = models.TextField(verbose_name='Mensaje')
    
    # Enlace relacionado (opcional)
    enlace = models.CharField(max_length=500, blank=True, verbose_name='Enlace')
    
    # Estado
    leida = models.BooleanField(default=False, verbose_name='Leída')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notificaciones'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['usuario', 'leida']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Notificación para {self.usuario}: {self.titulo}"
