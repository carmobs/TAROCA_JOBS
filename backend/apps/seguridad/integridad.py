"""
Utilidades de integridad de datos mediante hashing criptográfico
Proporciona funciones para generar y verificar hashes SHA-256 y HMAC-SHA256,
permitiendo validar que los datos almacenados o transmitidos no han sido
alterados de forma maliciosa o accidental.
"""
import hashlib
import hmac
import json
from django.conf import settings
def sha256_hex(data: bytes) -> str:
    """Genera hash SHA-256 de datos binarios y retorna representación hexadecimal."""
    return hashlib.sha256(data).hexdigest()
def sha256_hex_str(text: str) -> str:
    """Genera hash SHA-256 de una cadena de texto."""
    return sha256_hex(text.encode('utf-8'))
def hmac_sha256(key: bytes, data: bytes) -> str:
    """Genera HMAC-SHA256 con clave secreta para autenticación de mensajes."""
    return hmac.new(key, data, hashlib.sha256).hexdigest()
def hmac_sha256_str(data: str, key: str = None) -> str:
    """
    Genera HMAC-SHA256 para una cadena de texto.
    
    Si no se proporciona clave, utiliza SECRET_KEY de Django.
    """
    if key is None:
        key = settings.SECRET_KEY
    return hmac_sha256(key.encode('utf-8'), data.encode('utf-8'))
def hash_json_payload(payload: dict) -> str:
    """
    Genera hash SHA-256 de un payload JSON.
    
    Las claves se ordenan alfabéticamente para garantizar
    consistencia independientemente del orden de inserción.
    """
    serialized = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return sha256_hex_str(serialized)
def verify_json_integrity(payload: dict, expected_hash: str) -> bool:
    """
    Verifica que el hash de un payload JSON coincida con el hash esperado.
    
    Utiliza hmac.compare_digest para prevenir ataques de timing.
    """
    return hmac.compare_digest(hash_json_payload(payload), expected_hash)
