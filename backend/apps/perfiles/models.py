"""
Modelos de Perfiles de Trabajadores
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.usuarios.models import Usuario


class PerfilTrabajador(models.Model):
    """
    Perfil extendido para usuarios tipo 'trabajador'
    """
    
    CATEGORIAS = (
        ('plomeria', 'Plomería'),
        ('electricidad', 'Electricidad'),
        ('carpinteria', 'Carpintería'),
        ('albañileria', 'Albañilería'),
        ('pintura', 'Pintura'),
        ('jardineria', 'Jardinería'),
        ('limpieza', 'Limpieza'),
        ('mecanica', 'Mecánica'),
        ('tecnologia', 'Tecnología'),
        ('otros', 'Otros'),
    )
    
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_trabajador')
    
    # Información profesional
    titulo_profesional = models.CharField(max_length=120, blank=True, default='', verbose_name='Título Profesional')
    categoria = models.CharField(max_length=50, choices=CATEGORIAS, verbose_name='Categoría')
    categorias = models.JSONField(default=list, verbose_name='Categorías')
    especialidades = models.JSONField(default=list, verbose_name='Especialidades')
    experiencia_anos = models.PositiveIntegerField(default=0, verbose_name='Años de Experiencia')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    modalidades_servicio = models.JSONField(default=list, verbose_name='Modalidades de Servicio')
    tiempo_respuesta_horas = models.PositiveIntegerField(default=24, verbose_name='Tiempo de Respuesta (horas)')
    certificaciones = models.JSONField(default=list, verbose_name='Certificaciones')
    idiomas = models.JSONField(default=list, verbose_name='Idiomas')
    herramientas = models.JSONField(default=list, verbose_name='Herramientas / Equipo')
    
    # Ubicación
    ubicacion = models.CharField(max_length=200, verbose_name='Ubicación')
    zona_servicio = models.JSONField(default=list, verbose_name='Zonas de Servicio')
    
    # Tarifas
    tarifa_hora = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Tarifa por Hora'
    )
    tarifa_minima = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Tarifa Mínima'
    )
    
    # Calificación y estadísticas
    calificacion_promedio = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name='Calificación Promedio'
    )
    total_trabajos = models.PositiveIntegerField(default=0, verbose_name='Total de Trabajos')
    total_resenas = models.PositiveIntegerField(default=0, verbose_name='Total de Reseñas')
    
    # Disponibilidad
    disponible = models.BooleanField(default=True, verbose_name='Disponible')
    horario_disponibilidad = models.JSONField(
        default=dict,
        verbose_name='Horario de Disponibilidad'
    )
    
    # Verificación
    identidad_verificada = models.BooleanField(default=False, verbose_name='Identidad Verificada')
    domicilio_verificado = models.BooleanField(default=False, verbose_name='Domicilio Verificado')

    # Imagenes del perfil
    foto_perfil = models.ImageField(upload_to='perfiles/fotos/', null=True, blank=True, verbose_name='Foto de Perfil')
    foto_portada = models.ImageField(upload_to='perfiles/portadas/', null=True, blank=True, verbose_name='Foto de Portada')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'perfiles_trabajadores'
        verbose_name = 'Perfil de Trabajador'
        verbose_name_plural = 'Perfiles de Trabajadores'
        indexes = [
            models.Index(fields=['categoria']),
            models.Index(fields=['calificacion_promedio']),
            models.Index(fields=['disponible']),
        ]
    
    def __str__(self):
        titulo = self.titulo_profesional or self.get_categoria_display()
        return f"Perfil de {self.usuario.nombre_completo} - {titulo}"
    
    def actualizar_calificacion(self):
        """Actualizar calificación promedio basada en reseñas"""
        from apps.resenas.models import Resena
        resenas = Resena.objects.filter(trabajador=self)
        if resenas.exists():
            self.calificacion_promedio = resenas.aggregate(
                models.Avg('calificacion')
            )['calificacion__avg'] or 0.00
            self.total_resenas = resenas.count()
            self.save(update_fields=['calificacion_promedio', 'total_resenas'])


class Portafolio(models.Model):
    """
    Portafolio multimedia de trabajos realizados
    Se almacenará en MongoDB para manejar contenido multimedia
    """
    
    TIPOS_MEDIA = (
        ('imagen', 'Imagen'),
        ('video', 'Video'),
    )
    
    perfil = models.ForeignKey(
        PerfilTrabajador,
        on_delete=models.CASCADE,
        related_name='portafolios'
    )
    
    titulo = models.CharField(max_length=200, verbose_name='Título')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    tipo_media = models.CharField(max_length=20, choices=TIPOS_MEDIA, verbose_name='Tipo de Media')
    
    # Archivo (se guardará en media/ localmente o S3 en producción)
    archivo = models.FileField(upload_to='portafolios/%Y/%m/', verbose_name='Archivo')
    
    # Orden de visualización
    orden = models.PositiveIntegerField(default=0, verbose_name='Orden')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'portafolios'
        verbose_name = 'Portafolio'
        verbose_name_plural = 'Portafolios'
        ordering = ['orden', '-created_at']
    
    def __str__(self):
        return f"{self.titulo} - {self.perfil.usuario.nombre_completo}"
