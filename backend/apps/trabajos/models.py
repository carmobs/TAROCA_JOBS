from django.db import models
from apps.usuarios.models import Usuario
from apps.perfiles.models import PerfilTrabajador
from apps.seguridad.fields import EncryptedTextField

class Trabajo(models.Model):
    """Modelo para solicitudes de trabajo/servicio"""

    PRIORIDAD_CHOICES = [
        ('normal', 'Normal'),
        ('urgente', 'Urgente'),
        ('programado', 'Programado'),
    ]

    MODALIDAD_CHOICES = [
        ('domicilio', 'A domicilio'),
        ('presencial', 'Presencial'),
        ('remoto', 'Remoto'),
    ]
    
    ESTADO_CHOICES = [
        ('abierto', 'Abierto - Buscando trabajadores'),
        ('asignado', 'Asignado - Trabajo en progreso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]
    
    # Usuario que solicita el trabajo
    cliente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='trabajos_solicitados')
    
    # Trabajador asignado (opcional)
    trabajador = models.ForeignKey(
        PerfilTrabajador, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='trabajos_asignados'
    )
    
    # Información del trabajo
    titulo = models.CharField(max_length=200)
    # Campo cifrado con Fernet (AES-128)
    descripcion = EncryptedTextField()
    categoria = models.CharField(max_length=50)
    municipio = models.CharField(max_length=100)
    modalidad = models.CharField(max_length=20, choices=MODALIDAD_CHOICES, default='domicilio')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='normal')
    
    # Detalles
    presupuesto_estimado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fecha_deseada = models.DateField(null=True, blank=True)
    fecha_maxima_respuesta = models.DateField(null=True, blank=True)
    # Campo cifrado con Fernet (AES-128)
    detalles_adicionales = EncryptedTextField(blank=True)
    
    # Estado
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='abierto')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.titulo} - {self.cliente.nombre_completo}"


class Cotizacion(models.Model):
    """Modelo para cotizaciones de trabajadores"""
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente de respuesta'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
    ]
    
    trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE, related_name='cotizaciones')
    trabajador = models.ForeignKey(
        PerfilTrabajador, 
        on_delete=models.CASCADE, 
        related_name='mis_cotizaciones'
    )
    
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    # Campo cifrado con Fernet (AES-128)
    descripcion = EncryptedTextField()
    fecha_estimada = models.DateField(null=True, blank=True)
    tiempo_estimado_horas = models.PositiveIntegerField(null=True, blank=True)
    vigencia_horas = models.PositiveIntegerField(default=24)
    incluye_materiales = models.BooleanField(default=False)
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['trabajo', 'trabajador']
    
    def __str__(self):
        return f"Propuesta de {self.trabajador.usuario.nombre} para {self.trabajo.titulo}"
