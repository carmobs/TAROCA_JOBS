# Plataforma de Conexión Trabajadores - Colima, México

## 📋 Descripción
Plataforma digital para conectar trabajadores y clientes en Colima, México. Sistema escalable con enfoque en confianza, seguridad y experiencia de usuario.

## � ESTADO ACTUAL: DEMO FUNCIONAL (6 Mayo 2026)

✅ **Flujo completo end-to-end implementado y listo para demostración**

### Flujo Demo
```
HOME → SEARCH → WORKER PROFILE → CREATE JOB → CHAT → NEGOTIATE
```

- [x] Página de inicio con hero y búsqueda
- [x] Búsqueda de trabajadores con filtros
- [x] Perfil público del trabajador
- [x] Creación de solicitud de servicio
- [x] Visualización de cotizaciones
- [x] Chat en tiempo real
- [x] Dashboard de usuario
- [x] Sistema de autenticación JWT

### 📚 Documentación Demo
- **[GUIA_DEMO_MANANA.md](./GUIA_DEMO_MANANA.md)** - Guía paso a paso para demostración
- **[FLUJO_DEMO.md](./FLUJO_DEMO.md)** - Documentación técnica completa
- **[RESUMEN_CAMBIOS.md](./RESUMEN_CAMBIOS.md)** - Cambios realizados

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: React 18 + React Router 6 + Tailwind CSS 3.4 + React Query 4
- **Backend**: Django 4.2 + Django REST Framework 3.14 + Channels 4.0
- **Autenticación**: JWT (djangorestframework-simplejwt)
- **Real-time**: WebSocket (Socket.io)
- **Bases de Datos**: 
  - PostgreSQL 15 (datos estructurados)
  - MongoDB 7 (datos no estructurados)
  - Redis 7 (cache y channel layer)

### Estructura del Proyecto
```
├── backend/          # Django REST API (8 apps)
│   ├── autenticacion/
│   ├── usuarios/
│   ├── perfiles/
│   ├── busqueda/
│   ├── trabajos/       # Solicitudes
│   ├── cotizaciones/   # Ofertas de trabajadores
│   ├── chat/           # Mensajería real-time
│   ├── notificaciones/
│   └── resenas/        # Reviews
├── frontend/         # React PWA Application
│   ├── src/pages/public/      # HomePage, SearchPage, etc
│   ├── src/pages/protected/   # Dashboard, Chat, etc
│   ├── src/components/
│   ├── src/context/           # AuthContext
│   └── src/services/          # API service
├── docs/             # Documentación técnica
├── docker-compose.yml
└── scripts/          # Scripts de utilidad
```

## 🚀 Inicio Rápido (PARA DEMO)

### Requisitos Previos
- Python 3.11+
- Node.js 18+
- PostgreSQL 15 (o SQLite para desarrollo)

### Paso 1: Backend (Django)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows: venv\Scripts\activate
source venv/bin/activate # macOS/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# Backend corriendo en http://localhost:8000
```

### Paso 2: Frontend (React)
```bash
cd frontend
npm install
npm start
# Frontend abierto en http://localhost:3000
```

### Paso 3: Prueba el Flujo Demo
Ver instrucciones detalladas en [GUIA_DEMO_MANANA.md](./GUIA_DEMO_MANANA.md)

**Flujo Demo (5-10 minutos)**:
1. Homepage → Busca un trabajador
2. SearchPage → Ve resultados con filtros
3. WorkerProfile → Ve perfil completo
4. CreateJob → Crea una solicitud
5. JobDetail → Ve cotizaciones
6. Chat → Conversa en tiempo real
7. Dashboard → Ve tu actividad

### Docker (Opcional)
```bash
docker-compose up -d
# Inicia todos los servicios
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 📚 Módulos Principales

### Backend (Django)
- **Autenticación**: JWT tokens (djangorestframework-simplejwt)
- **Usuarios**: Gestión de perfiles (trabajadores/clientes)
- **Perfiles**: Información detallada de trabajadores
- **Búsqueda**: Filtros por categoría, municipio, calificación
- **Trabajos**: Creación y gestión de solicitudes de servicio
- **Cotizaciones**: Ofertas de trabajadores
- **Chat**: Mensajería real-time con WebSocket
- **Reseñas**: Sistema de calificaciones de trabajadores
- **Notificaciones**: Sistema de alertas

### Frontend (React)
**Páginas Públicas** (sin autenticación):
- **HomePage** → `/` - Landing con búsqueda y categorías
- **SearchPage** → `/search` - Búsqueda con filtros
- **WorkerProfile** → `/perfil/{id}` - Perfil público del trabajador
- **LoginPage** → `/login` - Formulario de login
- **RegisterPage** → `/register` - Creación de cuenta
- **NotFoundPage** → `*` - Página 404

**Páginas Protegidas** (requieren autenticación):
- **CreateJobPage** → `/solicitar` o `/solicitar/{id}` - Crear solicitud
- **MyJobsListPage** → `/mis-solicitudes` - Mis solicitudes
- **JobDetailPage** → `/mis-solicitudes/{id}` - Detalles + cotizaciones
- **ChatPage** → `/chat` o `/chat/{id}` - Chat real-time
- **DashboardPage** → `/dashboard` - Resumen de actividad

### Features Implementadas
- ✅ Autenticación JWT con roles
- ✅ Búsqueda multidimensional (categoría, municipio, calificación)
- ✅ Perfiles públicos de trabajadores
- ✅ Creación de solicitudes con validaciones
- ✅ Sistema de cotizaciones
- ✅ Chat en tiempo real (WebSocket)
- ✅ Dashboard de usuario
- ✅ Responsive design (mobile + desktop)
- ✅ Toast notifications
- ✅ Loading states y error handling

## 🔒 Seguridad
- Autenticación JWT
- Cifrado HTTPS/TLS
- Validación de datos en cliente y servidor
- Protección XSS y CSRF
- Control de acceso basado en roles (RBAC)

## 📊 Base de Datos

### PostgreSQL (Estructurada)
- Usuarios, perfiles, roles
- Suscripciones y transacciones
- Reseñas verificadas

### MongoDB (No Estructurada)
- Portafolios multimedia
- Mensajes de chat
- Notificaciones
- Registros complementarios

## 🧪 Testing
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📦 Deployment
Ver documentación en `docs/deployment.md`

## 👥 Equipo de Desarrollo
Proyecto desarrollado para Colima, México - 2025

## 📄 Licencia
Propietario - Todos los derechos reservados
