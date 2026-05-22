"""
Views para Autenticación
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    ChangePasswordSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada para obtener tokens JWT"""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Vista para registro de nuevos usuarios"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generar tokens para el usuario recién registrado
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'nombre': user.nombre,
                'apellido': user.apellido,
                'telefono': user.telefono,
                'rol': user.rol,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)


class ChangePasswordView(generics.UpdateAPIView):
    """Vista para cambiar contraseña"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Contraseña actualizada exitosamente'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Vista para cerrar sesión (blacklist del refresh token)"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Sesión cerrada exitosamente'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Token inválido o ya expirado'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
    """Vista para verificar si el token es válido"""
    return Response({
        'valid': True,
        'user': {
            'id': request.user.id,
            'email': request.user.email,
            'nombre': request.user.nombre,
            'apellido': request.user.apellido,
            'telefono': request.user.telefono,
            'rol': request.user.rol,
            'is_verificado': request.user.is_verificado,
        }
    }, status=status.HTTP_200_OK)


class GoogleAuthView(generics.GenericAPIView):
    """
    Vista para autenticación con Google OAuth2
    
    Recibe un token de Google y retorna un token JWT
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """
        Endpoint POST para Google OAuth2
        
        Requiere:
        - id_token: Token de identificación de Google (obtener en frontend)
        
        Retorna:
        - JWT tokens (access y refresh)
        - Información del usuario
        """
        id_token = request.data.get('id_token')
        
        if not id_token:
            return Response({
                'error': 'Se requiere id_token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Importar aquí para evitar ciclos
            from google.auth.transport import requests
            from google.oauth2 import id_token as google_id_token
            
            # Verificar el token de Google
            try:
                idinfo = google_id_token.verify_oauth2_token(
                    id_token, 
                    requests.Request()
                )
                # Token es válido
                from django.conf import settings as django_settings

                # Si se configuró GOOGLE_CLIENT_ID en settings, verificar audience
                expected_aud = getattr(django_settings, 'GOOGLE_CLIENT_ID', '')
                if expected_aud:
                    if idinfo.get('aud') != expected_aud:
                        return Response({
                            'error': 'El token no fue emitido para este client_id (aud mismatch)'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
            except Exception as e:
                return Response({
                    'error': f'Token de Google inválido: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Obtener información del usuario de Google
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            if not email:
                return Response({
                    'error': 'No se pudo obtener email de Google'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Obtener o crear usuario
            from apps.usuarios.models import Usuario
            
            user, created = Usuario.objects.get_or_create(
                email=email,
                defaults={
                    'nombre': first_name or email.split('@')[0],
                    'apellido': last_name or '',
                    'is_verificado': True,
                    'rol': 'cliente',
                }
            )
            
            # Actualizar información si el usuario es nuevo
            if created or not user.nombre:
                user.nombre = first_name or user.nombre
                user.apellido = last_name or user.apellido
                user.is_verificado = True
                user.save()
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'nombre': user.nombre,
                    'apellido': user.apellido,
                    'telefono': user.telefono,
                    'rol': user.rol,
                    'is_verificado': user.is_verificado,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Autenticado con Google exitosamente',
                'is_new_user': created,
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': f'Error en autenticación: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
