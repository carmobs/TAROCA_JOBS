# Implementación de Firmas Digitales - TAROCA JOBS

## Descripción General

Se ha implementado un sistema de **verificación de autenticidad e integridad con firmas digitales HMAC-SHA256**. Las firmas garantizan que:

1. **Autenticidad**: Los datos provienen de quien dice ser (solo quien tiene la clave secreta puede crear la firma)
2. **Integridad**: Los datos no han sido modificados (cualquier cambio invalida la firma)
3. **No repudio**: El firmante no puede negar haber creado el documento

## Componentes Implementados

### 1. Módulo de Firmas (`apps/seguridad/firmas.py`)

#### Clase `FirmaDigital`
- Genera y verifica firmas HMAC-SHA256
- Incluye timestamp para prevenir **replay attacks**
- Usa `hmac.compare_digest()` para prevenir **timing attacks**
- Métodos principales:
  - `firmar(datos, include_timestamp=True)` - Firmar datos
  - `verificar(datos, firma, max_edad_segundos=3600)` - Verificar firma
  - `firmar_json(payload)` - Firmar JSON con claves ordenadas
  - `verificar_json(payload, firma)` - Verificar firma JSON

#### Clase `VerificadorIntegridad`
- Genera hashes SHA-256 de datos
- Diferencia con firmas: **sin autenticidad, solo integridad**
- Métodos principales:
  - `calcular_hash(datos)` - Generar hash SHA-256
  - `verificar_hash(datos, hash_esperado)` - Verificar integridad

### 2. Mixin de Modelos (`apps/seguridad/mixins.py`)

#### `ModeloConFirma`
Mixin que proporciona firma automática a cualquier modelo:

```python
class MiModelo(models.Model, ModeloConFirma):
    datos_importantes = models.TextField()
    firma = models.TextField(blank=True)
    hash_integridad = models.CharField(max_length=64, blank=True)
    
    def get_datos_para_firmar(self) -> str:
        """Implementar este método"""
        return json.dumps({
            'field1': self.field1,
            'field2': self.field2,
        })
```

Métodos disponibles:
- `firmar()` - Generar y guardar firma
- `verificar_firma()` - Verificar que la firma sea válida
- `calcular_integridad()` - Generar hash de integridad
- `verificar_integridad()` - Verificar integridad sin autenticidad

#### Decorador `@validar_firma`
Valida firmas automáticamente en vistas DRF:

```python
@validar_firma
def crear_cotizacion(self, request):
    # Firma se valida automáticamente
    ...
```

### 3. Signals Automáticas (`apps/seguridad/mixins.py`)

Las firmas se generan **automáticamente** al crear modelos:

```python
# En apps.py
class MiAppConfig(AppConfig):
    def ready(self):
        from django.db.models.signals import post_save
        from .models import MiModelo
        from apps.seguridad.mixins import generar_firma_automatica
        
        post_save.connect(generar_firma_automatica, sender=MiModelo)
```

## Modelos con Firmas Implementadas

### 1. **Cotizacion** (`apps/trabajos/models.py`)
- **Campos firmados**: precio, fecha, vigencia, materiales
- **Razón**: Verificar que la propuesta económica no fue alterada
- **Firma automática**: Sí

```python
# Uso
cotizacion = Cotizacion.objects.create(...)
# Firma generada automáticamente
print(cotizacion.firma)  # "f974e5df...timestamp"
print(cotizacion.hash_integridad)  # "a3f2c1d..."
```

### 2. **Resena** (`apps/resenas/models.py`)
- **Campos firmados**: calificación, título, comentario, verificada
- **Razón**: Prevenir manipulación de reseñas y calificaciones
- **Firma automática**: Sí

```python
# Uso
resena = Resena.objects.create(...)
# Firma generada automáticamente
resena.verificar_firma()  # True/False
```

## Características de Seguridad

### HMAC-SHA256
✓ **Autenticidad**: Solo quien tiene SECRET_KEY puede crear firmas  
✓ **Integridad**: Cualquier byte cambiado invalida la firma  
✓ **No repudio**: Imposible negar la firma (excepto si la clave se compromete)

### Prevención de Ataques
✓ **Timing Attacks**: Usa `hmac.compare_digest()` (comparación en tiempo constante)  
✓ **Replay Attacks**: Incluye timestamp (máx edad: 1 hora por defecto)  
✓ **Tampering**: Verifica integridad completa con cada operación  

### Derivación de Clave
✓ **Clave base**: Django's `SECRET_KEY`  
✓ **Seguridad**: 256 bits (32 bytes)  
✓ **No rotación**: Usa la misma clave que autenticación

## Uso en Desarrollo

### Firmar Datos Manualmente

```python
from apps.seguridad.firmas import obtener_firma_digital

firma_digital = obtener_firma_digital()

# Firmar con timestamp
datos = "Propuesta de $500"
firma = firma_digital.firmar(datos)  # Con timestamp

# Firmar sin timestamp
firma = firma_digital.firmar(datos, include_timestamp=False)

# Verificar
es_valida = firma_digital.verificar(datos, firma)  # True
```

### Firmar JSON

```python
payload = {
    "trabajo_id": 42,
    "precio": "500.00",
    "vigencia": 24
}

# Firmar (claves ordenadas automáticamente)
firma = firma_digital.firmar_json(payload)

# Verificar
es_valida = firma_digital.verificar_json(payload, firma)  # True
```

### Verificar Integridad (Sin Autenticidad)

```python
from apps.seguridad.firmas import obtener_verificador_integridad

verificador = obtener_verificador_integridad()

datos = "Calificación: 5 estrellas"
hash_integrity = verificador.calcular_hash(datos)

# Verificar (sin autenticidad)
es_intacto = verificador.verificar_hash(datos, hash_integrity)  # True
```

### Modelos con Firma

```python
# Crear cotización (firma generada automáticamente)
cot = Cotizacion.objects.create(
    trabajo=trabajo,
    trabajador=trabajador,
    precio=500,
    descripcion="Pintura completa"
)

# Verificar firma
print(cot.verificar_firma())  # True
print(cot.verificar_integridad())  # True

# Los datos generan la misma firma siempre
datos = cot.get_datos_para_firmar()
firma_recalculada = obtener_firma_digital().firmar(datos, include_timestamp=False)
```

## Testing

Prueba rápida:

```bash
cd backend
python manage.py shell -c "
from apps.seguridad.firmas import obtener_firma_digital

firma_digital = obtener_firma_digital()
datos = 'Test'
firma = firma_digital.firmar(datos)
print('✓ OK' if firma_digital.verificar(datos, firma) else '✗ ERROR')
"
```

Prueba completa:

```bash
python manage.py shell < test_firmas.py
```

## Ventajas vs Desventajas

### ✓ Ventajas
- No requiere claves asimétricas (RSA)
- Muy rápido (< 1ms por firma)
- Detección automática de tampering
- Prevención de replay attacks
- Timestamp incluido
- Funcionamiento transparente

### ✗ Limitaciones
- Requiere SECRET_KEY compartida (simétrico)
- No hay negación de responsabilidad (si se compromete la clave)
- No escalable a múltiples partes
- No se puede verificar sin la clave

## Comparativa: Cifrado vs Firmas

| Aspecto | Cifrado (Fernet) | Firmas (HMAC) |
|--------|---|---|
| **Objetivo** | Confidencialidad | Autenticidad + Integridad |
| **Lectura de datos** | ✗ Encriptados | ✓ Públicos |
| **Detección de cambios** | ✓ Sí | ✓ Sí |
| **Quién puede verificar** | ✗ Solo dueño de clave | ✓ Todos |
| **Caso de uso** | Datos sensibles privados | Transacciones verificables |

## Próximas Mejoras (Futuro)

- [ ] Firmas RSA/ECDSA (asimetría)
- [ ] Múltiples algoritmos de firma
- [ ] Auditoría de firmas (quién, cuándo)
- [ ] Timestamps de terceros confiables
- [ ] Encadenamiento de firmas (blockchain-like)
- [ ] Revocación de firmas

## Referencia

- [Python HMAC](https://docs.python.org/3/library/hmac.html)
- [Cryptography.io](https://cryptography.io/en/latest/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 2104 - HMAC](https://tools.ietf.org/html/rfc2104)

---

**Implementado**: Mayo 2026  
**Estado**: ✓ Producción Lista
