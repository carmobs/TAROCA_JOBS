# Guía: Obtener Credenciales de Google OAuth2

## Paso 1: Acceder a Google Cloud Console

1. Abre https://console.cloud.google.com/
2. Si no tienes cuenta de Google, créala primero
3. Inicia sesión con tu cuenta de Google

## Paso 2: Crear un Nuevo Proyecto

1. En la esquina superior izquierda, haz click en "Select a Project"
2. Haz click en "NEW PROJECT"
3. Nombra el proyecto: `TAROCA_JOBS` o similar
4. Haz click en "CREATE"
5. Espera a que se cree el proyecto (puede tomar unos segundos)

## Paso 3: Habilitar Google+ API

1. En la barra de búsqueda arriba, escribe "Google+ API"
2. Selecciona "Google+ API" de los resultados
3. Haz click en "ENABLE"
4. Espera a que se habilite

## Paso 4: Crear OAuth 2.0 Client ID

1. En el menú izquierdo, ve a "Credentials"
2. Haz click en "CREATE CREDENTIALS" (arriba)
3. Selecciona "OAuth 2.0 Client ID"
4. Si te pide configurar OAuth Consent Screen:
   - Haz click en "Configure Consent Screen"
   - Elige "External" como tipo de usuario
   - Completa la información:
     - App name: TAROCA_JOBS
     - User support email: tu-email@gmail.com
     - Haz click en "Save and Continue"
   - En "Scopes", haz click en "Add or Remove Scopes"
   - Busca y selecciona:
     - `openid`
     - `.../auth/userinfo.profile`
     - `.../auth/userinfo.email`
   - Haz click en "Save and Continue"
   - En "Test users", haz click en "Save and Continue"
   - Haz click en "Back to Dashboard"

## Paso 5: Crear Credenciales OAuth

Después de configurar el Consent Screen:

1. De nuevo en "Credentials", haz click en "CREATE CREDENTIALS"
2. Selecciona "OAuth 2.0 Client ID"
3. En "Application type", selecciona "Web application"
4. En "Name", escribe algo como "TAROCA_JOBS_Web"
5. En "Authorized redirect URIs", agrega:
   ```
   http://localhost:3000/auth/callback
   http://localhost:8000/accounts/google/login/callback/
   http://127.0.0.1:3000/auth/callback
   ```
   Para producción, también agrega:
   ```
   https://yourdomain.com/auth/callback
   ```
6. Haz click en "CREATE"

## Paso 6: Copiar el Client ID

1. En la tabla de "OAuth 2.0 Client IDs", verás una fila con "Web application"
2. Haz click en ella para expandir
3. Copia el "Client ID" (es una cadena larga)
4. Guárdalo en un lugar seguro

## Paso 7: Configurar tu aplicación local

### Backend

1. En `backend/.env`, agrega:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   ```

### Frontend

1. En `frontend/.env.local` (crea el archivo si no existe), agrega:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here
   REACT_APP_API_URL=http://localhost:8000
   ```

## Paso 8: Probar la integración

1. Abre una terminal y ve al directorio frontend:
   ```bash
   cd frontend
   npm install  # Si es la primera vez
   npm start
   ```

2. Abre otra terminal y ve al directorio backend:
   ```bash
   cd backend
   python manage.py runserver
   ```

3. Abre http://localhost:3000 en tu navegador
4. Busca el botón "Entrar con Google"
5. Haz click y prueba el login

## Paso 9: Configurar para Producción

Cuando estés listo para desplegar:

1. Ve a Google Cloud Console > Credentials
2. Selecciona tu OAuth Client ID
3. En "Authorized redirect URIs", agrega tu dominio:
   ```
   https://yourdomain.com/auth/callback
   ```
4. Haz click en "SAVE"
5. En tu servidor de producción, configura:
   ```bash
   GOOGLE_CLIENT_ID=your-production-client-id
   ```

## Troubleshooting

### Error: "Client ID is invalid"
- Asegúrate de copiar el Client ID correcto (sin espacios)
- Verifica que el dominio está autorizado en Google Cloud Console

### Error: "Redirect URI mismatch"
- El dominio desde donde accedes debe estar en "Authorized redirect URIs"
- Si estás en http://localhost:3000, asegúrate de que esté en la lista
- Para producción, usa https (no http)

### Error: "Token has expired"
- Es normal, los tokens de Google expiran rápidamente
- El frontend maneja esto automáticamente

### No aparece el botón de Google
- Verifica que REACT_APP_GOOGLE_CLIENT_ID está en tu `.env.local`
- Abre la consola del navegador (F12) y busca errores
- Verifica que no hay errores de CORS

## Recursos Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentación de Google Sign-In](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

Si necesitas ayuda, consulta el archivo `OAUTH2_GOOGLE_GUIDE.md` en la raíz del proyecto.
