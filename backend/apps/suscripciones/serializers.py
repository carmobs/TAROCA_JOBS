"""
Serializers para Suscripciones
"""
from rest_framework import serializers
from .models import PlanSuscripcion, Suscripcion, Transaccion


class PlanSuscripcionSerializer(serializers.ModelSerializer):
    """Serializer para planes de suscripción"""
    
    class Meta:
        model = PlanSuscripcion
        fields = [
            'id', 'nombre', 'descripcion', 'precio', 'periodo',
            'destacar_perfil', 'apariciones_top', 'insignia_premium',
            'soporte_prioritario', 'estadisticas_avanzadas'
        ]


class SuscripcionSerializer(serializers.ModelSerializer):
    """Serializer para suscripciones"""
    
    plan = PlanSuscripcionSerializer(read_only=True)
    esta_activa = serializers.ReadOnlyField()
    
    class Meta:
        model = Suscripcion
        fields = [
            'id', 'usuario', 'plan', 'fecha_inicio', 'fecha_fin',
            'estado', 'esta_activa', 'renovacion_automatica',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usuario', 'fecha_inicio', 'fecha_fin', 'created_at', 'updated_at']


class CrearSuscripcionSerializer(serializers.Serializer):
    """Serializer para crear suscripción"""
    
    plan_id = serializers.IntegerField()
    metodo_pago = serializers.CharField(max_length=50)


class TransaccionSerializer(serializers.ModelSerializer):
    """Serializer para transacciones"""
    
    class Meta:
        model = Transaccion
        fields = [
            'id', 'suscripcion', 'usuario', 'monto', 'estado',
            'metodo_pago', 'referencia_pago', 'created_at'
        ]
        read_only_fields = ['id', 'usuario', 'created_at']
