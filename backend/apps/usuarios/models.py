"""
Modelos de Usuario
Sistema de usuarios con roles: Cliente, Trabajador, Admin
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Crear y guardar un usuario regular"""
        if not email:
            raise ValueError('El usuario debe tener un email')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crear y guardar un superusuario"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('rol', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de Usuario personalizado
    Roles: cliente, trabajador, admin
    """
    
    ROLES = (
        ('cliente', 'Cliente'),
        ('trabajador', 'Trabajador'),
        ('admin', 'Administrador'),
    )
    
    # Información básica
    email = models.EmailField(unique=True, verbose_name='Correo Electrónico')
    nombre = models.CharField(max_length=100, verbose_name='Nombre')
    apellido = models.CharField(max_length=100, verbose_name='Apellido')
    telefono = models.CharField(max_length=15, blank=True, verbose_name='Teléfono')
    foto_perfil = models.ImageField(upload_to='perfiles/', null=True, blank=True, verbose_name='Foto de Perfil')
    
    # Rol y permisos
    rol = models.CharField(max_length=20, choices=ROLES, default='cliente', verbose_name='Rol')
    
    # Estado del usuario
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    is_staff = models.BooleanField(default=False, verbose_name='Staff')
    is_verificado = models.BooleanField(default=False, verbose_name='Verificado')
    
    # Fechas
    fecha_registro = models.DateTimeField(default=timezone.now, verbose_name='Fecha de Registro')
    ultimo_acceso = models.DateTimeField(null=True, blank=True, verbose_name='Último Acceso')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UsuarioManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-fecha_registro']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['rol']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"
    
    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"
    
    def actualizar_ultimo_acceso(self):
        """Actualizar timestamp del último acceso"""
        self.ultimo_acceso = timezone.now()
        self.save(update_fields=['ultimo_acceso'])
