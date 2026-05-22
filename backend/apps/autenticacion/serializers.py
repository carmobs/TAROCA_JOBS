"""
Serializers para Autenticación
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.usuarios.models import Usuario


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personalizado para JWT con información adicional"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agregar información personalizada al token
        token['email'] = user.email
        token['nombre'] = user.nombre
        token['rol'] = user.rol
        token['is_verificado'] = user.is_verificado
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agregar información del usuario a la respuesta
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'nombre': self.user.nombre,
            'apellido': self.user.apellido,
            'telefono': self.user.telefono,
            'rol': self.user.rol,
            'is_verificado': self.user.is_verificado,
        }
        
        # Actualizar último acceso
        self.user.actualizar_ultimo_acceso()
        
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registro de usuarios"""
    
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    
    class Meta:
        model = Usuario
        fields = ['email', 'password', 'password_confirm', 'nombre', 'apellido', 'telefono', 'rol']
    
    def validate_email(self, value):
        """Validar que el email no exista"""
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado")
        return value
    
    def validate(self, data):
        """Validar que las contraseñas coincidan"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
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


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña"""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, write_only=True, min_length=8)
    
    def validate_old_password(self, value):
        """Validar que la contraseña actual sea correcta"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta")
        return value
    
    def validate(self, data):
        """Validar que las nuevas contraseñas coincidan"""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Las contraseñas no coinciden"})
        return data
    
    def save(self):
        """Guardar nueva contraseña"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserDetailsSerializer(serializers.ModelSerializer):
    """Serializer para detalles del usuario (usado por dj-rest-auth)"""
    
    nombre_completo = serializers.ReadOnlyField()
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre', 'apellido', 'nombre_completo',
            'telefono', 'foto_perfil', 'rol', 'is_verificado',
            'fecha_registro', 'ultimo_acceso'
        ]
        read_only_fields = ['id', 'fecha_registro', 'ultimo_acceso']


class GoogleAuthTokenSerializer(serializers.Serializer):
    """Serializer para recibir token de Google y obtener JWT"""
    
    id_token = serializers.CharField(required=False)
    access_token = serializers.CharField(required=False)
    
    def validate(self, data):
        """Validar que se proporcione al menos un token"""
        if not data.get('id_token') and not data.get('access_token'):
            raise serializers.ValidationError(
                "Se requiere id_token o access_token"
            )
        return data
