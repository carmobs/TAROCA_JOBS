"""
Modelos de Reseñas
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.usuarios.models import Usuario
from apps.perfiles.models import PerfilTrabajador
from apps.seguridad.mixins import ModeloConFirma


class Resena(models.Model, ModeloConFirma):
    """
    Reseña de cliente hacia trabajador
    """
    cliente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='resenas_realizadas',
        verbose_name='Cliente'
    )
    trabajador = models.ForeignKey(
        PerfilTrabajador,
        on_delete=models.CASCADE,
        related_name='resenas',
        verbose_name='Trabajador'
    )
    
    # Calificación
    calificacion = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Calificación'
    )
    
    # Comentario
    titulo = models.CharField(max_length=200, verbose_name='Título')
    comentario = models.TextField(verbose_name='Comentario')
    
    # Verificación (solo si hubo transacción real)
    verificada = models.BooleanField(default=False, verbose_name='Verificada')
    
    # Campos de firma digital para verificar autenticidad de reseña
    firma = models.TextField(blank=True, verbose_name='Firma Digital')
    hash_integridad = models.CharField(
        max_length=64,
        blank=True,
        verbose_name='Hash de Integridad SHA-256'
    )
    
    # Respuesta del trabajador
    respuesta = models.TextField(blank=True, verbose_name='Respuesta')
    fecha_respuesta = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Respuesta')
    
    # Utilidad
    util_count = models.PositiveIntegerField(default=0, verbose_name='Votos Útiles')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resenas'
        verbose_name = 'Reseña'
        verbose_name_plural = 'Reseñas'
        ordering = ['-created_at']
        unique_together = ['cliente', 'trabajador']  # Una reseña por cliente-trabajador
        indexes = [
            models.Index(fields=['trabajador', '-created_at']),
            models.Index(fields=['calificacion']),
            models.Index(fields=['verificada']),
        ]
    
    def __str__(self):
        return f"Reseña de {self.cliente} para {self.trabajador.usuario.nombre_completo}"
    
    def get_datos_para_firmar(self) -> str:
        """
        Obtener datos críticos de la reseña para firmar.
        
        Incluye calificación y comentario que definen la reseña.
        La respuesta del trabajador no se incluye (es posterior).
        """
        import json
        datos = {
            'cliente_id': self.cliente.id,
            'trabajador_id': self.trabajador.id,
            'calificacion': self.calificacion,
            'titulo': self.titulo,
            'comentario': self.comentario,
            'verificada': self.verificada,
        }
        return json.dumps(datos, sort_keys=True)
    
    def save(self, *args, **kwargs):
        """Al guardar, actualizar calificación del trabajador"""
        super().save(*args, **kwargs)
        self.trabajador.actualizar_calificacion()


class VotoUtil(models.Model):
    """
    Votos de utilidad en reseñas
    """
    resena = models.ForeignKey(
        Resena,
        on_delete=models.CASCADE,
        related_name='votos'
    )
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'votos_utiles'
        verbose_name = 'Voto Útil'
        verbose_name_plural = 'Votos Útiles'
        unique_together = ['resena', 'usuario']
    
    def __str__(self):
        return f"Voto de {self.usuario} en reseña {self.resena.id}"
