"""
Views para Reseñas
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.utils import timezone
from .models import Resena, VotoUtil
from .serializers import (
    ResenaSerializer,
    CrearResenaSerializer,
    ResponderResenaSerializer
)


class ResenaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de reseñas"""
    
    queryset = Resena.objects.select_related('cliente', 'trabajador__usuario')
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action == 'create':
            return CrearResenaSerializer
        return ResenaSerializer
    
    def get_queryset(self):
        """Filtrar reseñas"""
        queryset = super().get_queryset()
        
        # Filtro por trabajador
        trabajador_id = self.request.query_params.get('trabajador')
        if trabajador_id:
            queryset = queryset.filter(trabajador_id=trabajador_id)
        
        # Filtro por calificación
        calificacion = self.request.query_params.get('calificacion')
        if calificacion:
            queryset = queryset.filter(calificacion=calificacion)
        
        # Solo verificadas
        if self.request.query_params.get('verificadas'):
            queryset = queryset.filter(verificada=True)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Crear reseña"""
        # Verificar que el usuario no haya dejado ya una reseña
        trabajador = serializer.validated_data['trabajador']
        
        if Resena.objects.filter(
            cliente=self.request.user,
            trabajador=trabajador
        ).exists():
            raise serializers.ValidationError(
                "Ya has dejado una reseña para este trabajador"
            )
        
        serializer.save(cliente=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def responder(self, request, pk=None):
        """Trabajador responde a una reseña"""
        resena = self.get_object()
        
        # Verificar que el usuario sea el trabajador de la reseña
        if resena.trabajador.usuario != request.user:
            return Response(
                {'error': 'Solo el trabajador puede responder a esta reseña'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ResponderResenaSerializer(data=request.data)
        if serializer.is_valid():
            resena.respuesta = serializer.validated_data['respuesta']
            resena.fecha_respuesta = timezone.now()
            resena.save()
            
            return Response(ResenaSerializer(resena).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def marcar_util(self, request, pk=None):
        """Marcar reseña como útil"""
        resena = self.get_object()
        
        # Verificar si ya votó
        voto_existente = VotoUtil.objects.filter(
            resena=resena,
            usuario=request.user
        ).exists()
        
        if voto_existente:
            return Response(
                {'message': 'Ya marcaste esta reseña como útil'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear voto
        VotoUtil.objects.create(resena=resena, usuario=request.user)
        resena.util_count += 1
        resena.save(update_fields=['util_count'])
        
        return Response({'message': 'Reseña marcada como útil'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mis_resenas(self, request):
        """Obtener reseñas del usuario actual"""
        resenas = Resena.objects.filter(cliente=request.user)
        serializer = self.get_serializer(resenas, many=True)
        return Response(serializer.data)
