"""
Adaptadores personalizados para django-allauth
Extienden el comportamiento por defecto para integración con nuestro sistema de usuarios
"""

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Adaptador personalizado para manejo de cuentas locales
    """
    
    def is_open_for_signup(self, request):
        """Permitir registros locales en desarrollo"""
        return getattr(settings, 'ACCOUNT_ALLOW_REGISTRATION', True)
    
    def save_user(self, request, sociallogin, form=None):
        """Guardar usuario personalizado"""
        user = super().save_user(request, sociallogin, form)
        return user


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Adaptador personalizado para OAuth2 / Social Authentication
    """
    
    def pre_social_login(self, request, sociallogin):
        """
        Ejecutarse antes de login social
        Aquí se pueden hacer validaciones adicionales
        """
        # Verificar si el email ya existe en el sistema
        if sociallogin.is_existing:
            return
        
        # Si el usuario ya existe, conectar automáticamente
        try:
            user = sociallogin.account.user
            if user.email:
                # Usuario con email que ya existe puede conectar
                pass
        except:
            pass
    
    def save_user(self, request, sociallogin, form=None):
        """
        Guardar usuario desde OAuth
        Personalizar campos según nuestro modelo de Usuario
        """
        user = super().save_user(request, sociallogin, form)
        
        # Datos del proveedor social
        extra_data = sociallogin.account.extra_data
        
        # Llenar campos del usuario con información de Google
        if extra_data.get('given_name'):
            user.nombre = extra_data.get('given_name')
        
        if extra_data.get('family_name'):
            user.apellido = extra_data.get('family_name')
        
        # Marcar email como verificado si viene de Google
        user.is_verificado = True
        
        # Establecer rol por defecto
        if not user.rol:
            user.rol = 'cliente'
        
        user.save()
        return user
