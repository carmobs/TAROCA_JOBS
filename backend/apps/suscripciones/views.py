"""
Views para Suscripciones
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from .models import PlanSuscripcion, Suscripcion, Transaccion
from .serializers import (
    PlanSuscripcionSerializer,
    SuscripcionSerializer,
    CrearSuscripcionSerializer,
    TransaccionSerializer
)


class PlanSuscripcionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar planes de suscripción"""
    
    queryset = PlanSuscripcion.objects.filter(activo=True)
    serializer_class = PlanSuscripcionSerializer
    permission_classes = [AllowAny]


class SuscripcionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de suscripciones"""
    
    serializer_class = SuscripcionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Obtener suscripciones del usuario actual"""
        return Suscripcion.objects.filter(usuario=self.request.user)
    
    @action(detail=False, methods=['get'])
    def activa(self, request):
        """Obtener suscripción activa del usuario"""
        try:
            suscripcion = Suscripcion.objects.get(
                usuario=request.user,
                estado='activa',
                fecha_fin__gte=timezone.now()
            )
            serializer = self.get_serializer(suscripcion)
            return Response(serializer.data)
        except Suscripcion.DoesNotExist:
            return Response(
                {'message': 'No tienes una suscripción activa'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def crear_suscripcion(self, request):
        """Crear nueva suscripción"""
        serializer = CrearSuscripcionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Obtener plan
        try:
            plan = PlanSuscripcion.objects.get(id=serializer.validated_data['plan_id'])
        except PlanSuscripcion.DoesNotExist:
            return Response(
                {'error': 'Plan no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Crear suscripción
        suscripcion = Suscripcion.objects.create(
            usuario=request.user,
            plan=plan,
            estado='pendiente'
        )
        
        # Crear transacción
        transaccion = Transaccion.objects.create(
            suscripcion=suscripcion,
            usuario=request.user,
            monto=plan.precio,
            metodo_pago=serializer.validated_data['metodo_pago'],
            estado='pendiente'
        )
        
        # TODO: Integrar con pasarela de pago
        # Por ahora, marcar como completada (simulación)
        transaccion.estado = 'completada'
        transaccion.save()
        
        suscripcion.estado = 'activa'
        suscripcion.save()
        
        return Response(
            SuscripcionSerializer(suscripcion).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancelar suscripción"""
        suscripcion = self.get_object()
        suscripcion.cancelar()
        
        return Response({
            'message': 'Suscripción cancelada exitosamente',
            'suscripcion': SuscripcionSerializer(suscripcion).data
        })


class TransaccionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar transacciones"""
    
    serializer_class = TransaccionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Obtener transacciones del usuario actual"""
        return Transaccion.objects.filter(usuario=self.request.user)
