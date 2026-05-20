"""
Views para Chat
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Conversacion, Mensaje
from .serializers import ConversacionSerializer, MensajeSerializer


class ConversacionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de conversaciones"""
    
    serializer_class = ConversacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Obtener conversaciones del usuario actual"""
        user = self.request.user
        return Conversacion.objects.filter(
            Q(participante_1=user) | Q(participante_2=user)
        ).order_by('-updated_at')
    
    @action(detail=False, methods=['post'])
    def iniciar_chat(self, request):
        """Iniciar o obtener conversación con otro usuario"""
        otro_usuario_id = request.data.get('usuario_id')
        
        if not otro_usuario_id:
            return Response(
                {'error': 'usuario_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from apps.usuarios.models import Usuario
            otro_usuario = Usuario.objects.get(id=otro_usuario_id)
            
            if otro_usuario == request.user:
                return Response(
                    {'error': 'No puedes iniciar un chat contigo mismo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            conversacion = Conversacion.obtener_o_crear(request.user, otro_usuario)
            serializer = self.get_serializer(conversacion)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Usuario.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def mensajes(self, request, pk=None):
        """Obtener mensajes de una conversación"""
        conversacion = self.get_object()
        
        # Verificar que el usuario sea participante
        if request.user not in [conversacion.participante_1, conversacion.participante_2]:
            return Response(
                {'error': 'No tienes acceso a esta conversación'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        mensajes = conversacion.mensajes.all()
        serializer = MensajeSerializer(mensajes, many=True)
        
        # Marcar mensajes como leídos
        conversacion.mensajes.filter(
            leido=False
        ).exclude(
            remitente=request.user
        ).update(leido=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enviar_mensaje(self, request, pk=None):
        """Enviar mensaje en una conversación (API REST fallback)"""
        conversacion = self.get_object()
        
        # Verificar que el usuario sea participante
        if request.user not in [conversacion.participante_1, conversacion.participante_2]:
            return Response(
                {'error': 'No tienes acceso a esta conversación'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        contenido = request.data.get('contenido')
        if not contenido:
            return Response(
                {'error': 'contenido es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mensaje = Mensaje.objects.create(
            conversacion=conversacion,
            remitente=request.user,
            contenido=contenido
        )
        
        serializer = MensajeSerializer(mensaje)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MensajeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para lectura de mensajes"""
    
    serializer_class = MensajeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Obtener mensajes de conversaciones del usuario"""
        user = self.request.user
        return Mensaje.objects.filter(
            Q(conversacion__participante_1=user) |
            Q(conversacion__participante_2=user)
        ).order_by('-created_at')
