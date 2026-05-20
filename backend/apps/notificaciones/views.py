"""
Views para Notificaciones
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notificacion
from .serializers import NotificacionSerializer


class NotificacionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de notificaciones"""
    
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Obtener notificaciones del usuario actual"""
        return Notificacion.objects.filter(usuario=self.request.user)
    
    @action(detail=False, methods=['get'])
    def no_leidas(self, request):
        """Obtener notificaciones no leídas"""
        notificaciones = self.get_queryset().filter(leida=False)
        serializer = self.get_serializer(notificaciones, many=True)
        
        return Response({
            'count': notificaciones.count(),
            'notificaciones': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marcar notificación como leída"""
        notificacion = self.get_object()
        notificacion.leida = True
        notificacion.save()
        
        return Response({'message': 'Notificación marcada como leída'})
    
    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marcar todas las notificaciones como leídas"""
        self.get_queryset().filter(leida=False).update(leida=True)
        
        return Response({'message': 'Todas las notificaciones marcadas como leídas'})
    
    @action(detail=False, methods=['delete'])
    def eliminar_leidas(self, request):
        """Eliminar notificaciones leídas"""
        count = self.get_queryset().filter(leida=True).delete()[0]
        
        return Response({'message': f'{count} notificaciones eliminadas'})
