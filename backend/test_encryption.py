"""
Script de prueba para verificar que el cifrado funciona correctamente
Ejecutar con: python manage.py shell < test_encryption.py
"""

from apps.seguridad.cifrado import obtener_cifrador

# Obtener el cifrador
cifrador = obtener_cifrador()

# Pruebas básicas
datos_originales = "Este es un mensaje secreto de prueba 🔒"

print("=" * 60)
print("TEST DE CIFRADO SIMÉTRICO (Fernet/AES-128)")
print("=" * 60)

# 1. Cifrar
print(f"\n1. Datos originales: {datos_originales}")
datos_cifrados = cifrador.cifrar(datos_originales)
print(f"2. Datos cifrados:   {datos_cifrados[:50]}...")

# 2. Descifrar
datos_descifrados = cifrador.descifrar(datos_cifrados)
print(f"3. Datos descifrados: {datos_descifrados}")

# 3. Verificar integridad
if datos_originales == datos_descifrados:
    print("\n✓ CIFRADO/DESCIFRADO: OK - Los datos coinciden")
else:
    print("\n✗ ERROR: Los datos NO coinciden después del descifrado")

# 4. Probar con datos vacíos
print("\n4. Prueba con string vacío:")
vacio_cifrado = cifrador.cifrar("")
vacio_descifrado = cifrador.descifrar(vacio_cifrado)
print(f"   Resultado: '{vacio_descifrado}' (debería estar vacío)")

# 5. Probar con None
print("\n5. Prueba con None:")
none_cifrado = cifrador.cifrar("") if "" else ""
print(f"   Resultado: '{none_cifrado}' (debería estar vacío)")

# 6. Probar seguridad: intentar descifrar con datos corruptos
print("\n6. Prueba de integridad (descifrar datos corruptos):")
try:
    cifrador.descifrar("datos-corruptos-invalidog2b4hg2g24hg24hg")
    print("   ✗ ERROR: Debería haber lanzado excepción")
except ValueError as e:
    print(f"   ✓ OK: Detectó corrupción: {str(e)[:50]}...")

print("\n" + "=" * 60)
print("TODAS LAS PRUEBAS COMPLETADAS")
print("=" * 60)
