# Diagnóstico real de la app

Este documento resume qué necesita realmente la aplicación para funcionar hoy, según el código actual del repositorio.

## 1) Lo que realmente usa la aplicación hoy

### Backend
- Python 3.9.6.
- Django 4.2.17.
- Django REST Framework 3.14.
- `djangorestframework-simplejwt` para autenticación JWT.
- `django-cors-headers` para CORS.
- `channels` para WebSockets.
- `psycopg2-binary` para PostgreSQL.
- `python-decouple` para leer variables de entorno.
- `Pillow` para campos de imagen.

### Frontend
- React 18.
- `react-scripts` 5.
- `axios`.
- `@tanstack/react-query`.
- WebSocket nativo para el chat.

### Infraestructura obligatoria
- PostgreSQL como base principal.
- Backend Django corriendo como ASGI.
- Frontend React local.

## 2) Mínimo real para que la app corra bien

### Si trabajan en local
1. Instalar Python 3.9.x.
2. Crear una `venv` nueva con ese Python.
3. Instalar dependencias del backend con `pip install -r requirements.txt`.
4. Tener una base PostgreSQL accesible.
5. Configurar `backend/.env` con los datos reales de PostgreSQL.
6. Ejecutar migraciones.
7. Levantar el backend.
8. Instalar dependencias del frontend con `npm install`.
9. Levantar el frontend con `npm start`.

## 3) Lo que está sobredimensionado o no conectado

### Redis
- La caché y los channel layers están en memoria.
- No es obligatorio para el flujo actual.

### MongoDB
- Los modelos reales de la app son de Django y viven en PostgreSQL.
- No parece ser requisito real hoy.

### Celery
- No se ve un worker ni una configuración real de Celery en el código.
- Hoy parece preparativo, no parte del flujo funcional mínimo.

### django-allauth, django-storages y boto3
- No se ve uso real en el flujo principal actual.
- Pueden quedar como dependencias anticipadas.

### socket.io-client
- El chat usa `WebSocket` nativo, no Socket.IO.
- Probablemente sobra por ahora.

## 4) La contradicción principal que explica muchos errores

El backend no usa `DATABASE_URL` como fuente principal de conexión.

En `settings.py` la base de datos se lee desde:
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Eso significa que la configuración útil para el proyecto es `DB_*`, no `DATABASE_URL`.

## 5) Archivos que deberían revisarse o corregirse

### Prioridad alta
- [backend/config/settings.py](backend/config/settings.py)
- [backend/.env.example](backend/.env.example)
- [backend/.env](backend/.env)
- [frontend/package.json](frontend/package.json)

### Prioridad media
- [README.md](README.md)
- [frontend/src/setupProxy.js](frontend/src/setupProxy.js)

## 6) Qué quedó como verdad del proyecto

- PostgreSQL es la única base obligatoria.
- Python 3.9.6 es válido para este repo.
- Django + DRF + SimpleJWT + Channels son la base real del backend.
- React es la base real del frontend.
- Docker, Mongo, Redis y Celery ya no forman parte del flujo local actual.

## 7) Recomendación práctica

Para que tu compañero no tenga errores:
- Usar PostgreSQL real como única base obligatoria.
- Correr backend y frontend en local.
- Crear una nueva `venv` limpia con Python 3.9.6.
- Mantener el `.env` alineado con `DB_*`.
