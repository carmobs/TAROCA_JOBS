"""
Módulo de Firmas Digitales para Verificación de Autenticidad e Integridad

Proporciona funciones para:
- Firmar datos con HMAC-SHA256 (autenticidad + integridad)
- Verificar firmas
- Detectar tampering
- Prevenir ataques de timing
- Validar timestamps (prevenir replay attacks)
"""

import hmac
import hashlib
import json
import time
from datetime import datetime, timedelta
from django.conf import settings


class FirmaDigital:
    """
    Gestor de firmas digitales para verificar autenticidad e integridad de datos.
    
    Usa HMAC-SHA256:
    - Autenticidad: Solo quien tiene la clave puede crear la firma
    - Integridad: Cualquier cambio en los datos invalida la firma
    - Prevención de timing attacks: hmac.compare_digest
    """
    
    def __init__(self, secret_key: str = None):
        """
        Inicializar con clave secreta
        
        Args:
            secret_key (str): Clave para HMAC. Si es None, usa SECRET_KEY de Django
        """
        if secret_key is None:
            secret_key = settings.SECRET_KEY
        
        self.secret_key = secret_key
    
    def firmar(self, datos: str, include_timestamp: bool = True) -> str:
        """
        Firmar datos con HMAC-SHA256.
        
        Args:
            datos (str): Datos a firmar
            include_timestamp (bool): Incluir timestamp para prevenir replay attacks
        
        Returns:
            str: Firma en formato "firma.timestamp" o solo "firma"
        """
        if include_timestamp:
            timestamp = str(int(time.time()))
            mensaje = f"{datos}.{timestamp}"
        else:
            mensaje = datos
        
        firma = hmac.new(
            self.secret_key.encode('utf-8'),
            mensaje.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if include_timestamp:
            return f"{firma}.{timestamp}"
        else:
            return firma
    
    def verificar(self, datos: str, firma: str, max_edad_segundos: int = 3600) -> bool:
        """
        Verificar integridad y autenticidad de datos.
        
        Args:
            datos (str): Datos originales
            firma (str): Firma a verificar (formato "firma.timestamp" o "firma")
            max_edad_segundos (int): Máxima edad permitida del timestamp (defecto: 1 hora)
        
        Returns:
            bool: True si la firma es válida, False si no
        """
        try:
            # Separar firma y timestamp si existen
            if '.' in firma:
                partes = firma.rsplit('.', 1)
                if len(partes) == 2 and partes[1].isdigit():
                    firma_esperada, timestamp_str = partes
                    
                    # Verificar antigüedad del timestamp
                    timestamp = int(timestamp_str)
                    edad = int(time.time()) - timestamp
                    
                    if edad > max_edad_segundos:
                        return False  # Firma muy antigua (replay attack)
                    
                    # Verificar firma
                    mensaje = f"{datos}.{timestamp_str}"
                    firma_calculada = hmac.new(
                        self.secret_key.encode('utf-8'),
                        mensaje.encode('utf-8'),
                        hashlib.sha256
                    ).hexdigest()
                    
                    # Usar compare_digest para prevenir timing attacks
                    return hmac.compare_digest(firma_esperada, firma_calculada)
            
            # Verificar firma sin timestamp
            firma_calculada = hmac.new(
                self.secret_key.encode('utf-8'),
                datos.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(firma, firma_calculada)
        
        except Exception:
            return False
    
    def firmar_json(self, payload: dict, include_timestamp: bool = True) -> str:
        """
        Firmar un payload JSON.
        
        Las claves se ordenan alfabéticamente para garantizar consistencia.
        
        Args:
            payload (dict): Diccionario a firmar
            include_timestamp (bool): Incluir timestamp
        
        Returns:
            str: Firma del JSON
        """
        # Serializar con claves ordenadas para consistencia
        json_str = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return self.firmar(json_str, include_timestamp=include_timestamp)
    
    def verificar_json(self, payload: dict, firma: str, 
                      max_edad_segundos: int = 3600) -> bool:
        """
        Verificar firma de un payload JSON.
        
        Args:
            payload (dict): Diccionario original
            firma (str): Firma a verificar
            max_edad_segundos (int): Máxima edad permitida
        
        Returns:
            bool: True si la firma es válida
        """
        json_str = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return self.verificar(json_str, firma, max_edad_segundos=max_edad_segundos)


class VerificadorIntegridad:
    """
    Generador y verificador de hashes de integridad para datos críticos.
    
    Diferencia con firmas:
    - Firmas: Verifican autenticidad + integridad
    - Hashes: Solo verifican integridad (sin autenticidad)
    """
    
    @staticmethod
    def calcular_hash(datos: str) -> str:
        """
        Calcular hash SHA-256 de los datos.
        
        Args:
            datos (str): Datos a hashear
        
        Returns:
            str: Hash en formato hexadecimal
        """
        return hashlib.sha256(datos.encode('utf-8')).hexdigest()
    
    @staticmethod
    def calcular_hash_json(payload: dict) -> str:
        """
        Calcular hash SHA-256 de un JSON con claves ordenadas.
        
        Args:
            payload (dict): Diccionario a hashear
        
        Returns:
            str: Hash del JSON
        """
        json_str = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(json_str.encode('utf-8')).hexdigest()
    
    @staticmethod
    def verificar_hash(datos: str, hash_esperado: str) -> bool:
        """
        Verificar integridad de datos contra un hash.
        
        Args:
            datos (str): Datos a verificar
            hash_esperado (str): Hash esperado
        
        Returns:
            bool: True si los datos coinciden con el hash
        """
        hash_calculado = VerificadorIntegridad.calcular_hash(datos)
        return hmac.compare_digest(hash_calculado, hash_esperado)
    
    @staticmethod
    def verificar_hash_json(payload: dict, hash_esperado: str) -> bool:
        """
        Verificar integridad de un JSON contra un hash.
        
        Args:
            payload (dict): Diccionario a verificar
            hash_esperado (str): Hash esperado
        
        Returns:
            bool: True si el JSON coincide con el hash
        """
        hash_calculado = VerificadorIntegridad.calcular_hash_json(payload)
        return hmac.compare_digest(hash_calculado, hash_esperado)


# Instancias globales
_firma_digital = None
_verificador_integridad = None


def obtener_firma_digital() -> FirmaDigital:
    """Obtener instancia singleton de FirmaDigital"""
    global _firma_digital
    if _firma_digital is None:
        _firma_digital = FirmaDigital()
    return _firma_digital


def obtener_verificador_integridad() -> VerificadorIntegridad:
    """Obtener instancia singleton de VerificadorIntegridad"""
    global _verificador_integridad
    if _verificador_integridad is None:
        _verificador_integridad = VerificadorIntegridad()
    return _verificador_integridad
