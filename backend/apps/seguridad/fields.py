"""
Django Custom Fields con Cifrado Automático

Proporciona campos que cifran automáticamente valores al guardar
y descifran al recuperar, haciendo transparente el cifrado.
"""

from django.db import models
from .cifrado import obtener_cifrador


class EncryptedTextField(models.TextField):
    """
    TextField que cifra automáticamente el contenido.
    
    Usa Fernet (AES-128) bajo el hood.
    Completamente transparente: funciona como un TextField normal.
    """
    
    description = "TextField con cifrado simétrico automático"
    
    def get_prep_value(self, value):
        """Cifrar antes de guardar en DB"""
        if value is None or value == "":
            return value
        
        try:
            cifrador = obtener_cifrador()
            return cifrador.cifrar(value)
        except Exception as e:
            # Log del error pero no romper el flujo
            import logging
            logger = logging.getLogger('seguridad')
            logger.error(f"Error cifrando EncryptedTextField: {str(e)}")
            raise ValueError(f"No se pudo cifrar el contenido: {str(e)}")
    
    def from_db_value(self, value, expression, connection):
        """Descifrar al recuperar de DB"""
        if value is None or value == "":
            return value
        
        try:
            cifrador = obtener_cifrador()
            return cifrador.descifrar(value)
        except Exception as e:
            import logging
            logger = logging.getLogger('seguridad')
            logger.error(f"Error descifrando EncryptedTextField: {str(e)}")
            # Retornar valor encriptado si falla descifrado
            # (para evitar que se rompa la app)
            return value
    
    def deconstruct(self):
        """Permitir migraciones correctas"""
        name, path, args, kwargs = super().deconstruct()
        # Asegurar que el campo se trate como TextField en migraciones
        kwargs['max_length'] = kwargs.get('max_length', 4096)
        return name, path, args, kwargs


class EncryptedCharField(models.CharField):
    """
    CharField que cifra automáticamente el contenido.
    
    Útil para teléfono, direcciones cortas, etc.
    """
    
    description = "CharField con cifrado simétrico automático"
    
    def __init__(self, *args, **kwargs):
        # Aumentar max_length para acomodar el token cifrado
        # Un string encriptado con Fernet es ~{len(original)*1.5} + overhead
        if 'max_length' not in kwargs:
            kwargs['max_length'] = 512
        super().__init__(*args, **kwargs)
    
    def get_prep_value(self, value):
        """Cifrar antes de guardar en DB"""
        if value is None or value == "":
            return value
        
        try:
            cifrador = obtener_cifrador()
            return cifrador.cifrar(value)
        except Exception as e:
            import logging
            logger = logging.getLogger('seguridad')
            logger.error(f"Error cifrando EncryptedCharField: {str(e)}")
            raise ValueError(f"No se pudo cifrar el contenido: {str(e)}")
    
    def from_db_value(self, value, expression, connection):
        """Descifrar al recuperar de DB"""
        if value is None or value == "":
            return value
        
        try:
            cifrador = obtener_cifrador()
            return cifrador.descifrar(value)
        except Exception as e:
            import logging
            logger = logging.getLogger('seguridad')
            logger.error(f"Error descifrando EncryptedCharField: {str(e)}")
            return value
    
    def deconstruct(self):
        """Permitir migraciones correctas"""
        name, path, args, kwargs = super().deconstruct()
        return name, path, args, kwargs
