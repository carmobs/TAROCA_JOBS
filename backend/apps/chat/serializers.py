"""
Serializers para Chat
"""
from rest_framework import serializers
from .models import Conversacion, Mensaje
from apps.usuarios.serializers import UsuarioListSerializer


class MensajeSerializer(serializers.ModelSerializer):
    """Serializer para mensajes"""
    
    remitente = UsuarioListSerializer(read_only=True)
    
    class Meta:
        model = Mensaje
        fields = ['id', 'conversacion', 'remitente', 'contenido', 'leido', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversacionSerializer(serializers.ModelSerializer):
    """Serializer para conversaciones"""
    
    participante_1 = UsuarioListSerializer(read_only=True)
    participante_2 = UsuarioListSerializer(read_only=True)
    ultimo_mensaje = serializers.SerializerMethodField()
    mensajes_no_leidos = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversacion
        fields = [
            'id', 'participante_1', 'participante_2', 'activa',
            'ultimo_mensaje', 'mensajes_no_leidos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_ultimo_mensaje(self, obj):
        """Obtener último mensaje de la conversación"""
        ultimo = obj.mensajes.last()
        if ultimo:
            return {
                'contenido': ultimo.contenido,
                'remitente_id': ultimo.remitente.id,
                'timestamp': ultimo.created_at
            }
        return None
    
    def get_mensajes_no_leidos(self, obj):
        """Contar mensajes no leídos para el usuario actual"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.mensajes.filter(
                leido=False
            ).exclude(
                remitente=request.user
            ).count()
        return 0
