"""
Serializers para Usuarios
"""
from rest_framework import serializers
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer completo de usuario"""
    
    nombre_completo = serializers.ReadOnlyField()
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre', 'apellido', 'nombre_completo',
            'telefono', 'foto_perfil', 'rol', 'is_verificado', 'fecha_registro',
            'ultimo_acceso'
        ]
        read_only_fields = ['id', 'fecha_registro', 'ultimo_acceso']


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear usuarios"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = Usuario
        fields = [
            'email', 'password', 'password_confirm',
            'nombre', 'apellido', 'telefono', 'rol'
        ]
    
    def validate(self, data):
        """Validar que las contraseñas coincidan"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def create(self, validated_data):
        """Crear usuario con contraseña encriptada"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        usuario = Usuario.objects.create_user(
            password=password,
            **validated_data
        )
        return usuario


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar usuarios"""
    
    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido', 'telefono', 'foto_perfil', 'rol']


class UsuarioListSerializer(serializers.ModelSerializer):
    """Serializer para listar usuarios (datos básicos)"""
    
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'email', 'foto_perfil', 'rol', 'is_verificado']
