"""
Serializers para Perfiles
"""
from rest_framework import serializers
from .models import PerfilTrabajador, Portafolio
from apps.usuarios.serializers import UsuarioSerializer


class PortafolioSerializer(serializers.ModelSerializer):
    """Serializer para portafolios"""
    
    class Meta:
        model = Portafolio
        fields = ['id', 'perfil', 'titulo', 'descripcion', 'tipo_media', 'archivo', 'orden', 'created_at']
        read_only_fields = ['id', 'perfil', 'created_at']


class PerfilTrabajadorSerializer(serializers.ModelSerializer):
    """Serializer completo para perfil de trabajador"""
    
    usuario = UsuarioSerializer(read_only=True)
    portafolios = PortafolioSerializer(many=True, read_only=True)
    
    class Meta:
        model = PerfilTrabajador
        fields = [
            'id', 'usuario', 'titulo_profesional', 'categoria', 'especialidades', 'experiencia_anos',
            'descripcion', 'modalidades_servicio', 'tiempo_respuesta_horas', 'certificaciones',
            'idiomas', 'herramientas', 'ubicacion', 'zona_servicio', 'tarifa_hora',
            'tarifa_minima', 'calificacion_promedio', 'total_trabajos',
            'total_resenas', 'disponible', 'horario_disponibilidad',
            'identidad_verificada', 'domicilio_verificado', 'portafolios',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'calificacion_promedio', 'total_trabajos', 'total_resenas',
            'created_at', 'updated_at'
        ]


class PerfilTrabajadorListSerializer(serializers.ModelSerializer):
    """Serializer para listar perfiles (datos resumidos)"""
    
    nombre = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    
    class Meta:
        model = PerfilTrabajador
        fields = [
            'id', 'nombre', 'email', 'titulo_profesional', 'categoria', 'ubicacion',
            'modalidades_servicio', 'tiempo_respuesta_horas', 'calificacion_promedio',
            'total_resenas', 'tarifa_hora', 'disponible'
        ]
