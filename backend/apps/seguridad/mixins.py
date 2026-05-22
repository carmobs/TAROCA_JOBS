"""
Mixins y decoradores para aplicar verificación de autenticidad automáticamente.

Proporciona herramientas para integrar firmas digitales en modelos y vistas.
"""

from functools import wraps
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from apps.seguridad.firmas import obtener_firma_digital, obtener_verificador_integridad
import json


class ModeloConFirma:
    """
    Mixin para modelos que necesitan ser firmados.
    
    Requiere que el modelo tenga:
    - Campo: firma (CharField o TextField)
    - Campo: hash_integridad (CharField)
    - Método: get_datos_para_firmar() que retorne str
    """
    
    def firmar(self):
        """Generar firma para este modelo"""
        datos = self.get_datos_para_firmar()
        firma_digital = obtener_firma_digital()
        self.firma = firma_digital.firmar(datos, include_timestamp=True)
        return self.firma
    
    def verificar_firma(self) -> bool:
        """Verificar que la firma sea válida"""
        if not hasattr(self, 'firma') or not self.firma:
            return False
        
        datos = self.get_datos_para_firmar()
        firma_digital = obtener_firma_digital()
        
        # Permitir firmas con hasta 24 horas de antigüedad
        return firma_digital.verificar(
            datos, 
            self.firma, 
            max_edad_segundos=86400
        )
    
    def calcular_integridad(self):
        """Calcular hash de integridad del modelo"""
        datos = self.get_datos_para_firmar()
        verificador = obtener_verificador_integridad()
        self.hash_integridad = verificador.calcular_hash(datos)
        return self.hash_integridad
    
    def verificar_integridad(self) -> bool:
        """Verificar que los datos no hayan sido modificados"""
        if not hasattr(self, 'hash_integridad') or not self.hash_integridad:
            return False
        
        datos = self.get_datos_para_firmar()
        verificador = obtener_verificador_integridad()
        return verificador.verificar_hash(datos, self.hash_integridad)
    
    def get_datos_para_firmar(self) -> str:
        """
        Obtener datos a firmar. Debe ser implementado por cada modelo.
        
        Retorna un string con los datos críticos del modelo.
        """
        raise NotImplementedError(
            "Cada modelo debe implementar get_datos_para_firmar()"
        )


def validar_firma(view_func):
    """
    Decorador para validar firmas en vistas DRF.
    
    Uso:
        @validar_firma
        def crear_cotizacion(self, request):
            ...
    """
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        # Obtener firma del request
        firma = request.data.get('firma')
        
        if firma:
            # Si se proporciona firma, verificarla
            try:
                # Obtener datos (payload sin la firma)
                datos_dict = dict(request.data)
                datos_dict.pop('firma', None)
                
                # Firmar datos y comparar
                firma_digital = obtener_firma_digital()
                es_valida = firma_digital.verificar_json(
                    datos_dict, 
                    firma, 
                    max_edad_segundos=3600
                )
                
                if not es_valida:
                    return Response(
                        {'error': 'Firma inválida o expirada'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {'error': f'Error validando firma: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Llamar a la vista original
        return view_func(self, request, *args, **kwargs)
    
    return wrapper


def generar_firma_automatica(sender, instance, created, **kwargs):
    """
    Signal para generar firma automáticamente al guardar un modelo.
    
    Uso en apps.py:
        from django.apps import AppConfig
        from django.db.models.signals import post_save
        
        class MiAppConfig(AppConfig):
            def ready(self):
                from apps.seguridad.mixins import generar_firma_automatica
                from .models import MiModelo
                
                post_save.connect(generar_firma_automatica, sender=MiModelo)
    """
    if isinstance(instance, ModeloConFirma):
        if created or not instance.firma:
            instance.firmar()
            instance.calcular_integridad()
            # Guardar sin disparar signal de nuevo
            instance.__class__.objects.filter(pk=instance.pk).update(
                firma=instance.firma,
                hash_integridad=instance.hash_integridad
            )


class FieldSerializerConFirma(serializers.Serializer):
    """
    Serializer base para modelos con firma.
    
    Incluye campos de firma y hash de integridad.
    """
    
    firma = serializers.CharField(read_only=True, allow_blank=True)
    hash_integridad = serializers.CharField(read_only=True, allow_blank=True)
    es_firma_valida = serializers.SerializerMethodField()
    
    def get_es_firma_valida(self, obj) -> bool:
        """Verificar si la firma es válida en serialización"""
        if isinstance(obj, ModeloConFirma):
            return obj.verificar_firma()
        return False
