from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.db import connection
from .models import Trabajo, Cotizacion
from .serializers import (
    TrabajoListSerializer,
    TrabajoDetailSerializer,
    TrabajoCreateSerializer,
    CotizacionSerializer,
)
from apps.notificaciones.models import Notificacion
from apps.perfiles.models import PerfilTrabajador


class TrabajoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar trabajos/solicitudes"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Mostrar trabajos del cliente + trabajos abiertos para trabajadores (solo su categoría)
        base_query = Q(cliente=user)
        estados_abiertos = ['abierto', 'abierta', 'activa']
        perfil = PerfilTrabajador.objects.filter(usuario=user).first()
        if perfil:
            categorias = perfil.categorias or []
            if not categorias and perfil.categoria:
                categorias = [perfil.categoria]

            if categorias:
                open_jobs_query = Q(estado__in=estados_abiertos, categoria__in=categorias)
            else:
                open_jobs_query = Q(pk__in=[])

            return Trabajo.objects.filter(base_query | open_jobs_query).distinct()

        return Trabajo.objects.filter(base_query).distinct()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TrabajoCreateSerializer
        elif self.action == 'retrieve':
            return TrabajoDetailSerializer
        return TrabajoListSerializer
    
    def perform_create(self, serializer):
        trabajo = serializer.save()
        
        # Crear notificación para los trabajadores en esta categoría
        if connection.vendor == 'sqlite':
            trabajadores = [
                perfil for perfil in PerfilTrabajador.objects.all()
                if perfil.categoria == trabajo.categoria or (perfil.categorias and trabajo.categoria in perfil.categorias)
            ]
        else:
            trabajadores = PerfilTrabajador.objects.filter(
                Q(categoria=trabajo.categoria) | Q(categorias__contains=[trabajo.categoria])
            )
        for perfil in trabajadores:
            Notificacion.objects.create(
                usuario=perfil.usuario,
                titulo=f"Nueva solicitud: {trabajo.titulo}",
                mensaje=f"Hay una nueva solicitud en la categoría {trabajo.categoria}",
                tipo='trabajo',
                enlace=f"/mis-solicitudes/{trabajo.id}",
            )
    
    @action(detail=False, methods=['get'])
    def mis_solicitudes(self, request):
        """Obtener solicitudes del usuario autenticado"""
        trabajos = Trabajo.objects.filter(cliente=request.user)
        serializer = self.get_serializer(trabajos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def solicitudes_abiertas(self, request):
        """Obtener solicitudes abiertas en la categoría del trabajador"""
        perfil = PerfilTrabajador.objects.filter(usuario=request.user).first()
        if not perfil:
            return Response({'error': 'No eres un trabajador registrado'}, status=status.HTTP_400_BAD_REQUEST)
        
        estados_abiertos = ['abierto', 'abierta', 'activa']
        categorias = perfil.categorias or []
        if not categorias and perfil.categoria:
            categorias = [perfil.categoria]

        trabajos = Trabajo.objects.filter(categoria__in=categorias, estado__in=estados_abiertos)
        serializer = self.get_serializer(trabajos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'])
    def cotizaciones(self, request, pk=None):
        """Obtener o crear cotizaciones para un trabajo"""
        trabajo = self.get_object()
        
        if request.method == 'GET':
            # Obtener cotizaciones - solo el cliente del trabajo puede verlas
            if trabajo.cliente != request.user:
                return Response(
                    {'error': 'No tienes permiso para ver estas cotizaciones'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            cotizaciones = Cotizacion.objects.filter(trabajo=trabajo)
            serializer = CotizacionSerializer(cotizaciones, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Crear cotización - solo trabajadores registrados pueden crear
            perfil = PerfilTrabajador.objects.filter(usuario=request.user).first()
            if not perfil:
                return Response(
                    {'error': 'Necesitas registrarte como trabajador para enviar cotizaciones'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar que el trabajador no ya tiene una cotización en este trabajo
            if Cotizacion.objects.filter(trabajo=trabajo, trabajador=perfil).exists():
                return Response(
                    {'error': 'Ya has enviado una cotización para este trabajo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = CotizacionSerializer(data=request.data)
            if serializer.is_valid():
                cotizacion = serializer.save(trabajo=trabajo, trabajador=perfil)
                
                # Notificar al cliente
                Notificacion.objects.create(
                    usuario=trabajo.cliente,
                    titulo=f"Nueva propuesta: {trabajo.titulo}",
                    mensaje=f"{perfil.usuario.nombre} propone ${cotizacion.precio}",
                    tipo='trabajo',
                    enlace=f"/mis-solicitudes/{trabajo.id}",
                )
                
                return Response(CotizacionSerializer(cotizacion).data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CotizacionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar cotizaciones"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CotizacionSerializer
    queryset = Cotizacion.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        # Mostrar cotizaciones que el usuario creó o que son para sus trabajos
        return Cotizacion.objects.filter(
            Q(trabajador__usuario=user) | Q(trabajo__cliente=user)
        )
    
    @action(detail=False, methods=['get'])
    def mis_propuestas(self, request):
        """Obtener propuestas que el trabajador ha enviado"""
        perfil = PerfilTrabajador.objects.filter(usuario=request.user).first()
        if not perfil:
            return Response(
                {'error': 'No eres un trabajador registrado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cotizaciones = Cotizacion.objects.filter(trabajador=perfil).select_related(
            'trabajo', 'trabajo__cliente', 'trabajador'
        ).order_by('-created_at')
        
        serializer = CotizacionSerializer(cotizaciones, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
        if not perfil:
            raise permissions.PermissionDenied('Necesitas ser un trabajador para cotizar')
        
        cotizacion = serializer.save(trabajador=perfil)
        
        # Notificar al cliente
        Notificacion.objects.create(
            usuario=cotizacion.trabajo.cliente,
            titulo=f"Nueva cotización para {cotizacion.trabajo.titulo}",
            mensaje=f"{perfil.usuario.nombre} ha enviado una cotización por ${cotizacion.precio}",
            tipo='trabajo',
            enlace=f"/mis-solicitudes/{cotizacion.trabajo.id}",
        )
    
    @action(detail=True, methods=['post'])
    def aceptar(self, request, pk=None):
        """Aceptar una cotización (solo el cliente puede hacerlo)"""
        cotizacion = self.get_object()
        
        # Verificar que el usuario es el cliente
        if cotizacion.trabajo.cliente != request.user:
            return Response(
                {'error': 'Solo el cliente puede aceptar esta cotización'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Marcar como aceptada
        cotizacion.estado = 'aceptada'
        cotizacion.save()
        
        # Opcionalmente: rechazar las otras cotizaciones de este trabajo
        Cotizacion.objects.filter(
            trabajo=cotizacion.trabajo
        ).exclude(id=cotizacion.id).update(estado='rechazada')
        
        # Notificar al trabajador
        Notificacion.objects.create(
            usuario=cotizacion.trabajador.usuario,
            titulo=f"¡Tu cotización fue aceptada!",
            mensaje=f"El cliente aceptó tu propuesta para {cotizacion.trabajo.titulo}. Contacta al cliente para acordar los detalles.",
            tipo='trabajo',
            enlace='/mis-propuestas',
        )
        
        serializer = self.get_serializer(cotizacion)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechazar una cotización (solo el cliente puede hacerlo)"""
        cotizacion = self.get_object()
        
        # Verificar que el usuario es el cliente
        if cotizacion.trabajo.cliente != request.user:
            return Response(
                {'error': 'Solo el cliente puede rechazar esta cotización'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Marcar como rechazada
        cotizacion.estado = 'rechazada'
        cotizacion.save()
        
        # Notificar al trabajador
        Notificacion.objects.create(
            usuario=cotizacion.trabajador.usuario,
            titulo=f"Tu cotización fue rechazada",
            mensaje=f"El cliente no aceptó tu propuesta para {cotizacion.trabajo.titulo}",
            tipo='trabajo',
            enlace='/mis-propuestas',
        )
        
        serializer = self.get_serializer(cotizacion)
        return Response(serializer.data)
