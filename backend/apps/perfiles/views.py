"""
Views para Perfiles
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied
from .models import PerfilTrabajador, Portafolio
from .serializers import (
    PerfilTrabajadorSerializer,
    PerfilTrabajadorListSerializer,
    PortafolioSerializer
)


class PerfilTrabajadorViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de perfiles de trabajadores"""
    
    queryset = PerfilTrabajador.objects.select_related('usuario').prefetch_related('portafolios')
    serializer_class = PerfilTrabajadorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action == 'list':
            return PerfilTrabajadorListSerializer
        return PerfilTrabajadorSerializer

    def create(self, request, *args, **kwargs):
        """Crear un perfil de trabajador para el usuario autenticado."""
        if PerfilTrabajador.objects.filter(usuario=request.user).exists():
            return Response(
                {'error': 'Ya existe un perfil de trabajador para este usuario'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(usuario=request.user)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        perfil = self.get_object()
        if perfil.usuario != self.request.user:
            raise PermissionDenied('No tienes permiso para modificar este perfil')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.usuario != self.request.user:
            raise PermissionDenied('No tienes permiso para eliminar este perfil')
        instance.delete()

    @action(detail=False, methods=['post'])
    def crear(self, request):
        """Alias explícito para crear un perfil desde el frontend."""
        return self.create(request)
    
    def get_queryset(self):
        """Filtrar perfiles según parámetros"""
        queryset = super().get_queryset()
        
        # Filtros
        categoria = self.request.query_params.get('categoria')
        disponible = self.request.query_params.get('disponible')
        ubicacion = self.request.query_params.get('ubicacion')
        
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        if disponible:
            queryset = queryset.filter(disponible=disponible.lower() == 'true')
        if ubicacion:
            queryset = queryset.filter(ubicacion__icontains=ubicacion)
        
        # Ordenar por calificación por defecto
        return queryset.order_by('-calificacion_promedio')
    
    @action(detail=False, methods=['get'])
    def mi_perfil(self, request):
        """Obtener perfil del usuario actual"""
        try:
            perfil = PerfilTrabajador.objects.get(usuario=request.user)
            serializer = self.get_serializer(perfil)
            return Response(serializer.data)
        except PerfilTrabajador.DoesNotExist:
            return Response(
                {'error': 'No tienes un perfil de trabajador'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def agregar_portafolio(self, request, pk=None):
        """Agregar elemento al portafolio"""
        perfil = self.get_object()
        
        # Verificar que el usuario sea el dueño del perfil
        if perfil.usuario != request.user:
            return Response(
                {'error': 'No tienes permiso para modificar este perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PortafolioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(perfil=perfil)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PortafolioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de portafolios"""
    
    queryset = Portafolio.objects.all()
    serializer_class = PortafolioSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        """Filtrar portafolios por perfil"""
        queryset = super().get_queryset()
        perfil_id = self.request.query_params.get('perfil')
        
        if perfil_id:
            queryset = queryset.filter(perfil_id=perfil_id)
        else:
            perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
            if perfil:
                queryset = queryset.filter(perfil=perfil)
        
        return queryset

    def perform_create(self, serializer):
        perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
        if not perfil:
            raise PermissionDenied('Necesitas un perfil de trabajador para subir portafolio')
        serializer.save(perfil=perfil)
