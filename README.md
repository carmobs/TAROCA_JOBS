# Plataforma de Conexión Trabajadores - Colima, México

## Descripción
Plataforma digital para conectar trabajadores y clientes en Colima, México.

## Estado actual
El proyecto está simplificado para correr en local con esta base:

- Python 3.9.6
- Django 4.2 + Django REST Framework 3.14
- PostgreSQL
- React 18
- WebSocket nativo con Channels

## Arquitectura actual

### Backend
- Autenticación JWT con `djangorestframework-simplejwt`.
- Usuarios, perfiles, trabajos, cotizaciones, chat, reseñas y notificaciones.
- PostgreSQL como base principal.
- WebSocket con Channels para chat en tiempo real.

### Frontend
- React 18.
- React Router 6.
- Tailwind CSS 3.4.
- React Query 5.
- `axios` para llamadas HTTP.

## Requisitos

- Python 3.9.6.
- Node.js 18.
- PostgreSQL 15 o una versión compatible.

## Inicio rápido

### Backend
```bash
cd backend
python -m venv venv
.\\venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Variables de entorno del backend

Usa `backend/.env.example` como base y crea `backend/.env` con valores reales para PostgreSQL:

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `CORS_ALLOWED_ORIGINS`

## Flujo funcional

1. Iniciar PostgreSQL.
2. Levantar backend.
3. Levantar frontend.
4. Probar login y registro.
5. Probar búsqueda, perfil, solicitud y chat.

## Testing

```bash
cd backend
pytest

cd ../frontend
npm test
```
