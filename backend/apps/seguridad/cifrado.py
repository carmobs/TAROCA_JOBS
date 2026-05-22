"""
Módulo de Cifrado Simétrico para Transmisión y Almacenamiento Seguro

Utiliza Fernet (AES-128 en CBC mode) de cryptography para cifrar datos sensibles.
Fernet proporciona:
- Cifrado simétrico con generación automática de IV
- Autenticación mediante HMAC-SHA256
- Prevención de ataques de timing
- Timestamp incluido en el cifrado
"""

import os
import base64
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings


class CifradoSeguro:
    """
    Gestor centralizado de cifrado/descifrado simétrico.
    
    La clave maestra se genera a partir de:
    - ENCRYPTION_KEY del .env (debe ser al menos 32 caracteres)
    - Salt derivado del SECRET_KEY de Django
    """
    
    def __init__(self):
        """Inicializar con la clave configurada en .env"""
        encryption_key = getattr(settings, 'ENCRYPTION_KEY', None)
        
        if not encryption_key:
            raise ValueError(
                "ENCRYPTION_KEY no configurada. "
                "Agrega ENCRYPTION_KEY=[valor] a tu .env (al menos 32 caracteres)"
            )
        
        if len(encryption_key) < 32:
            raise ValueError(
                f"ENCRYPTION_KEY debe tener al menos 32 caracteres. "
                f"Longitud actual: {len(encryption_key)}"
            )
        
        self.encryption_key = encryption_key
        self._cipher_suite = None
    
    @property
    def cipher_suite(self):
        """Obtener o crear el cipher suite (Fernet)"""
        if self._cipher_suite is None:
            # Derivar clave de 32 bytes usando PBKDF2
            salt = settings.SECRET_KEY[:16].encode('utf-8')
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100_000,
            )
            key_bytes = base64.urlsafe_b64encode(
                kdf.derive(self.encryption_key.encode('utf-8'))
            )
            self._cipher_suite = Fernet(key_bytes)
        
        return self._cipher_suite
    
    def cifrar(self, datos: str) -> str:
        """
        Cifrar datos de texto.
        
        Args:
            datos (str): Texto a cifrar
        
        Returns:
            str: Token cifrado en formato base64 (seguro para almacenar en DB)
        """
        if not isinstance(datos, str):
            datos = str(datos)
        
        if not datos:
            return ""
        
        try:
            token_bytes = self.cipher_suite.encrypt(datos.encode('utf-8'))
            # Retornar como string para almacenar en CharField/TextField
            return token_bytes.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Error al cifrar datos: {str(e)}")
    
    def descifrar(self, token_cifrado: str) -> str:
        """
        Descifrar datos de texto.
        
        Args:
            token_cifrado (str): Token cifrado
        
        Returns:
            str: Texto descifrado
        
        Raises:
            ValueError: Si el token es inválido o está corrupto
        """
        if not token_cifrado:
            return ""
        
        try:
            datos = self.cipher_suite.decrypt(token_cifrado.encode('utf-8'))
            return datos.decode('utf-8')
        except InvalidToken:
            raise ValueError("Token de cifrado inválido o corrupto")
        except Exception as e:
            raise ValueError(f"Error al descifrar datos: {str(e)}")
    
    def cifrar_dict(self, datos_dict: dict) -> dict:
        """
        Cifrar valores específicos de un diccionario.
        
        Args:
            datos_dict (dict): Diccionario con datos a cifrar
        
        Returns:
            dict: Diccionario con valores cifrados
        """
        result = {}
        for key, value in datos_dict.items():
            if isinstance(value, str) and value:
                result[key] = self.cifrar(value)
            else:
                result[key] = value
        return result


# Instancia global del cifrador
_cifrador = None


def obtener_cifrador() -> CifradoSeguro:
    """Obtener instancia singleton del cifrador seguro"""
    global _cifrador
    if _cifrador is None:
        _cifrador = CifradoSeguro()
    return _cifrador
