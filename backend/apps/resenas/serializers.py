"""
Serializers para Reseñas
"""
from rest_framework import serializers
from .models import Resena, VotoUtil
from apps.usuarios.serializers import UsuarioListSerializer


class ResenaSerializer(serializers.ModelSerializer):
    """Serializer para reseñas"""
    
    cliente = UsuarioListSerializer(read_only=True)
    trabajador_nombre = serializers.CharField(
        source='trabajador.usuario.nombre_completo',
        read_only=True
    )
    
    class Meta:
        model = Resena
        fields = [
            'id', 'cliente', 'trabajador', 'trabajador_nombre',
            'calificacion', 'titulo', 'comentario', 'verificada',
            'respuesta', 'fecha_respuesta', 'util_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'verificada', 'util_count', 'created_at', 'updated_at'
        ]


class CrearResenaSerializer(serializers.ModelSerializer):
    """Serializer para crear reseñas"""
    
    class Meta:
        model = Resena
        fields = ['trabajador', 'calificacion', 'titulo', 'comentario']
    
    def validate_calificacion(self, value):
        """Validar que la calificación esté entre 1 y 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5")
        return value
    
    def create(self, validated_data):
        """Crear reseña con el usuario actual como cliente"""
        validated_data['cliente'] = self.context['request'].user
        return super().create(validated_data)


class ResponderResenaSerializer(serializers.Serializer):
    """Serializer para responder a una reseña"""
    
    respuesta = serializers.CharField(max_length=1000)
