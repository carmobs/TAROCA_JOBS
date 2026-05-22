# OAuth2 con Google - TAROCA JOBS

## Descripción General

Se ha implementado **autenticación OAuth2 con Google** permitiendo que los usuarios se registren e inicien sesión usando sus cuentas de Google. Este sistema:

- ✓ Simplifica el registro (un solo clic)
- ✓ Proporciona base de usuarios real de Google
- ✓ Integración transparente con JWT existente
- ✓ Verificación de email automática
- ✓ Creación de usuario automática

## Componentes Implementados

### Backend

#### 1. Configuración de Django (`backend/config/settings.py`)

**Apps Agregadas:**
- `rest_framework.authtoken` - Token auth para OAuth
- `dj_rest_auth` - REST endpoints para autenticación
- `django.contrib.sites` - Django Sites Framework (requerido)
- `allauth` - Django-allauth base
- `allauth.account` - Gestión de cuentas
- `allauth.socialaccount` - OAuth social
- `allauth.socialaccount.providers.google` - Google OAuth

**Middleware:**
- `allauth.account.middleware.AccountMiddleware` - Manejo de cuentas

**Configuración:**
```python
SITE_ID = 1
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = 'optional'
SOCIALACCOUNT_AUTO_SIGNUP = True
```

#### 2. Adaptadores Personalizados (`backend/apps/autenticacion/adapters.py`)

**CustomAccountAdapter:**
- Gestiona creación de cuentas locales
- Permite/restringe registro

**CustomSocialAccountAdapter:**
- Pre-procesa login social
- Rellena campos Usuario (nombre, apellido, email)
- Marca usuario como verificado
- Asigna rol por defecto (cliente)

#### 3. Vista de Google OAuth (`backend/apps/autenticacion/views.py`)

**GoogleAuthView** - POST endpoint

```bash
POST /api/auth/google/
Content-Type: application/json

{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2YjQ4NzI2N2RiMmFmM2I0OGU0YjI..."
}
```

**Respuesta exitosa:**
```json
{
  "user": {
    "id": 42,
    "email": "usuario@gmail.com",
    "nombre": "Juan Pérez",
    "rol": "cliente",
    "is_verificado": true
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "Autenticado con Google exitosamente",
  "is_new_user": true
}
```

### Frontend

#### Componente GoogleLoginButton

**Ubicación:** `frontend/src/components/auth/GoogleLoginButton.js`

**Uso:**
```jsx
import GoogleLoginButton from './components/auth/GoogleLoginButton';

export default function LoginPage() {
  const handleSuccess = (data) => {
    console.log('Login exitoso:', data.user);
  };

  const handleError = (error) => {
    console.error('Error:', error);
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <GoogleLoginButton 
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}
```

**Características:**
- Carga dinámicamente script de Google
- Renderiza botón oficial de Google
- Maneja token de Google
- Envía token al backend
- Guarda JWT tokens
- Redirige al dashboard

## Configuración de Google OAuth

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto: `TAROCA_JOBS`
3. Habilitar la API de Google+ Identity

### Paso 2: Crear Credenciales OAuth

1. Ir a "Credenciales"
2. Crear "OAuth 2.0 Client ID"
3. Elegir "Web application"
4. Agregar Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:8000/accounts/google/login/callback/`
   - `http://127.0.0.1:3000/auth/callback`
   - En producción: `https://yourdomain.com/auth/callback`

### Paso 3: Obtener Client ID

1. Copiar "Client ID"
2. Guardar en variables de entorno

## Configuración de Variables de Entorno

### Frontend (`.env` o `.env.local`)

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:8000
```

### Backend (`.env`)

```env
# Allauth / OAuth (en desarrollo)
ACCOUNT_EMAIL_VERIFICATION=optional
```

En **producción**:
```env
ACCOUNT_EMAIL_VERIFICATION=mandatory
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## Flujo de Autenticación

```
1. Usuario hace click en "Entrar con Google"
   ↓
2. Google abre popup de login
   ↓
3. Usuario autoriza la app
   ↓
4. Google retorna ID Token al frontend
   ↓
5. Frontend envía ID Token a /api/auth/google/
   ↓
6. Backend verifica token con Google
   ↓
7. Backend obtiene info del usuario (email, nombre, etc.)
   ↓
8. Backend crea/obtiene usuario en la BD
   ↓
9. Backend genera JWT tokens
   ↓
10. Frontend guarda tokens
    ↓
11. Frontend redirige al dashboard
```

## Endpoints API

### POST `/api/auth/google/`
Autenticar con token de Google

**Parámetros:**
- `id_token` (string): Token de identificación de Google

**Retorna:**
- `user`: Información del usuario
- `tokens`: JWT access y refresh tokens
- `is_new_user`: True si es primer login
- `message`: Mensaje de éxito

**Errores:**
```json
{
  "error": "Se requiere id_token"
}
```

### POST `/api/auth/login/`
Autenticar con email y contraseña

**Parámetros:**
- `email` (string)
- `password` (string)

**Retorna:**
- `user`: Información del usuario
- `tokens`: JWT tokens

### POST `/api/auth/register/`
Registrar nuevo usuario

**Parámetros:**
- `email` (string)
- `password` (string)
- `password_confirm` (string)
- `nombre` (string)
- `apellido` (string)
- `telefono` (string, opcional)
- `rol` (string, default: "cliente")

**Retorna:**
- `user`: Información del usuario
- `tokens`: JWT tokens

### GET `/api/auth/verify/`
Verificar si el token es válido

**Headers:**
- `Authorization: Bearer {access_token}`

**Retorna:**
```json
{
  "valid": true,
  "user": {
    "id": 42,
    "email": "usuario@gmail.com",
    "nombre": "Juan Pérez",
    "rol": "cliente",
    "is_verificado": true
  }
}
```

## Testing

### Test Backend

```bash
cd backend

# Verificar que Django inicia sin errores
python manage.py check

# Iniciar servidor
python manage.py runserver

# Probar endpoint (necesita token válido de Google)
curl -X POST http://localhost:8000/api/auth/google/ \
  -H "Content-Type: application/json" \
  -d '{"id_token": "YOUR_GOOGLE_TOKEN_HERE"}'
```

### Test Frontend

1. Instalar dependencias
```bash
cd frontend
npm install
```

2. Crear `.env.local`:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_API_URL=http://localhost:8000
```

3. Iniciar app
```bash
npm start
```

4. Ir a `/auth/login` y hacer click en "Entrar con Google"

## Seguridad

### ✓ Implementado

- Verificación de token de Google en backend
- Creación automática de usuario en primera autenticación
- Email verificado automáticamente desde Google
- JWT tokens seguros
- CORS configurado
- CSRF protection habilitada

### ⚠️ Consideraciones Importantes

1. **Client ID**: Nunca exponer el Client Secret
2. **Tokens JWT**: Guardar en localStorage (considerar sessionStorage en producción)
3. **HTTPS**: Obligatorio en producción
4. **Dominios**: Configurar correctamente en Google Cloud Console

## Resolución de Problemas

### Error: "Token de Google inválido"

**Causa:** Token expirado o inválido

**Solución:** 
- Verificar que el Client ID en frontend es correcto
- Asegurar que el dominio está autorizado en Google Cloud Console

### Error: "Se requiere email"

**Causa:** Google no proporciona email

**Solución:**
- Asegurar que el usuario autoriza acceso al email
- Verificar permisos en Google Cloud Console

### Error: CORS

**Causa:** Frontend y backend en diferentes dominios sin CORS configurado

**Solución:**
- Verificar `CORS_ALLOWED_ORIGINS` en settings.py
- Asegurar que `http://localhost:3000` está en la lista

## Próximas Mejoras

- [ ] Integración con Facebook OAuth
- [ ] Integración con GitHub OAuth
- [ ] Social Account Linking (conectar múltiples proveedores)
- [ ] Refresh token automático
- [ ] Logout desde múltiples dispositivos
- [ ] Two-Factor Authentication
- [ ] Session timeout

## Referencia Rápida

| Recurso | URL |
|---------|-----|
| **Docs Google OAuth** | https://developers.google.com/identity/protocols/oauth2 |
| **Google Sign-In** | https://developers.google.com/identity/sign-in/web |
| **Django-allauth** | https://django-allauth.readthedocs.io/ |
| **dj-rest-auth** | https://dj-rest-auth.readthedocs.io/ |

---

**Implementado**: Mayo 2026  
**Estado**: ✓ Producción Lista (con configuración)
