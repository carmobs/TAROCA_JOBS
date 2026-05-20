"""
Modelos de Suscripciones
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.usuarios.models import Usuario


class PlanSuscripcion(models.Model):
    """
    Planes de suscripción disponibles
    """
    
    PERIODOS = (
        ('mensual', 'Mensual'),
        ('trimestral', 'Trimestral'),
        ('anual', 'Anual'),
    )
    
    nombre = models.CharField(max_length=100, unique=True, verbose_name='Nombre')
    descripcion = models.TextField(verbose_name='Descripción')
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    periodo = models.CharField(max_length=20, choices=PERIODOS, verbose_name='Periodo')
    
    # Características
    destacar_perfil = models.BooleanField(default=False, verbose_name='Destacar Perfil')
    apariciones_top = models.BooleanField(default=False, verbose_name='Apariciones en Top')
    insignia_premium = models.BooleanField(default=False, verbose_name='Insignia Premium')
    soporte_prioritario = models.BooleanField(default=False, verbose_name='Soporte Prioritario')
    estadisticas_avanzadas = models.BooleanField(default=False, verbose_name='Estadísticas Avanzadas')
    
    # Metadata
    activo = models.BooleanField(default=True, verbose_name='Activo')
    orden = models.PositiveIntegerField(default=0, verbose_name='Orden de Visualización')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'planes_suscripcion'
        verbose_name = 'Plan de Suscripción'
        verbose_name_plural = 'Planes de Suscripción'
        ordering = ['orden', 'precio']
    
    def __str__(self):
        return f"{self.nombre} - ${self.precio} / {self.get_periodo_display()}"


class Suscripcion(models.Model):
    """
    Suscripción de un usuario a un plan
    """
    
    ESTADOS = (
        ('activa', 'Activa'),
        ('cancelada', 'Cancelada'),
        ('expirada', 'Expirada'),
        ('pendiente', 'Pendiente de Pago'),
    )
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='suscripciones'
    )
    plan = models.ForeignKey(PlanSuscripcion, on_delete=models.PROTECT)
    
    # Fechas
    fecha_inicio = models.DateTimeField(default=timezone.now, verbose_name='Fecha de Inicio')
    fecha_fin = models.DateTimeField(verbose_name='Fecha de Fin')
    
    # Estado
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente', verbose_name='Estado')
    
    # Renovación automática
    renovacion_automatica = models.BooleanField(default=True, verbose_name='Renovación Automática')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'suscripciones'
        verbose_name = 'Suscripción'
        verbose_name_plural = 'Suscripciones'
        ordering = ['-fecha_inicio']
        indexes = [
            models.Index(fields=['usuario', 'estado']),
            models.Index(fields=['fecha_fin']),
        ]
    
    def __str__(self):
        return f"Suscripción de {self.usuario} - {self.plan.nombre}"
    
    def save(self, *args, **kwargs):
        """Calcular fecha_fin automáticamente al crear"""
        if not self.pk and not self.fecha_fin:
            if self.plan.periodo == 'mensual':
                self.fecha_fin = self.fecha_inicio + timedelta(days=30)
            elif self.plan.periodo == 'trimestral':
                self.fecha_fin = self.fecha_inicio + timedelta(days=90)
            elif self.plan.periodo == 'anual':
                self.fecha_fin = self.fecha_inicio + timedelta(days=365)
        
        super().save(*args, **kwargs)
    
    @property
    def esta_activa(self):
        """Verificar si la suscripción está activa"""
        return (
            self.estado == 'activa' and
            self.fecha_inicio <= timezone.now() <= self.fecha_fin
        )
    
    def cancelar(self):
        """Cancelar suscripción"""
        self.estado = 'cancelada'
        self.renovacion_automatica = False
        self.save()


class Transaccion(models.Model):
    """
    Transacciones de pago de suscripciones
    """
    
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('completada', 'Completada'),
        ('fallida', 'Fallida'),
        ('reembolsada', 'Reembolsada'),
    )
    
    suscripcion = models.ForeignKey(
        Suscripcion,
        on_delete=models.CASCADE,
        related_name='transacciones'
    )
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    
    # Montos
    monto = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Monto')
    
    # Estado
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente', verbose_name='Estado')
    
    # Información de pago
    metodo_pago = models.CharField(max_length=50, blank=True, verbose_name='Método de Pago')
    referencia_pago = models.CharField(max_length=200, blank=True, verbose_name='Referencia')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transacciones'
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Transacción {self.id} - ${self.monto} - {self.get_estado_display()}"
