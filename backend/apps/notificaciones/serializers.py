"""
Serializers para Notificaciones
"""
from rest_framework import serializers
from .models import Notificacion


class NotificacionSerializer(serializers.ModelSerializer):
    """Serializer para notificaciones"""
    
    class Meta:
        model = Notificacion
        fields = [
            'id', 'usuario', 'tipo', 'titulo', 'mensaje',
            'enlace', 'leida', 'created_at'
        ]
        read_only_fields = ['id', 'usuario', 'created_at']
