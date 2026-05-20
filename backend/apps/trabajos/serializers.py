from rest_framework import serializers
from .models import Trabajo, Cotizacion
from apps.usuarios.serializers import UsuarioSerializer
from apps.perfiles.serializers import PerfilTrabajadorSerializer


class CotizacionSerializer(serializers.ModelSerializer):
    trabajador = PerfilTrabajadorSerializer(read_only=True)
    
    class Meta:
        model = Cotizacion
        fields = [
            'id', 'trabajo', 'trabajador', 'precio', 'descripcion', 'fecha_estimada',
            'tiempo_estimado_horas', 'vigencia_horas', 'incluye_materiales', 'estado', 'created_at'
        ]
        read_only_fields = ['id', 'trabajo', 'estado', 'created_at']


class TrabajoListSerializer(serializers.ModelSerializer):
    cliente = UsuarioSerializer(read_only=True)
    cotizaciones_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Trabajo
        fields = [
            'id', 'cliente', 'titulo', 'descripcion', 'categoria', 'municipio',
            'modalidad', 'prioridad', 'presupuesto_estimado', 'estado',
            'cotizaciones_count', 'created_at'
        ]
        read_only_fields = ['id', 'cliente', 'created_at']
    
    def get_cotizaciones_count(self, obj):
        return obj.cotizaciones.count()


class TrabajoDetailSerializer(serializers.ModelSerializer):
    cliente = UsuarioSerializer(read_only=True)
    trabajador = PerfilTrabajadorSerializer(read_only=True)
    cotizaciones = CotizacionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trabajo
        fields = [
            'id', 'cliente', 'trabajador', 'titulo', 'descripcion', 'categoria',
            'municipio', 'modalidad', 'prioridad', 'presupuesto_estimado',
            'fecha_deseada', 'fecha_maxima_respuesta', 'detalles_adicionales',
            'estado', 'cotizaciones', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'cliente', 'trabajador', 'created_at', 'updated_at']


class TrabajoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trabajo
        fields = [
            'titulo', 'descripcion', 'categoria', 'municipio', 'modalidad', 'prioridad',
            'presupuesto_estimado', 'fecha_deseada', 'fecha_maxima_respuesta', 'detalles_adicionales'
        ]
    
    def create(self, validated_data):
        validated_data['cliente'] = self.context['request'].user
        return super().create(validated_data)
