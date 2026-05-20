"""
Views para Búsqueda
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from apps.perfiles.serializers import PerfilTrabajadorListSerializer
from .services import BusquedaService, RecomendacionService, RankingService


class BusquedaTrabajadoresView(APIView):
    """Vista para buscar trabajadores"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Buscar trabajadores con filtros
        
        Parámetros:
        - q: Texto de búsqueda
        - categoria: Categoría del servicio
        - ubicacion: Ubicación
        - zona: Zona de servicio
        - disponible: true/false
        - calificacion_min: Calificación mínima (0-5)
        - precio_min: Precio mínimo
        - precio_max: Precio máximo
        - orden: calificacion, precio_asc, precio_desc, trabajos, reciente
        """
        resultados = BusquedaService.buscar_trabajadores(request.query_params)
        
        # Paginación
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        total = resultados.count()
        trabajadores = resultados[start:end]
        
        serializer = PerfilTrabajadorListSerializer(trabajadores, many=True)
        
        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'results': serializer.data
        })


class CategoriasPopularesView(APIView):
    """Vista para obtener categorías populares"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Obtener categorías con más trabajadores"""
        categorias = BusquedaService.obtener_categorias_populares()
        return Response(categorias)


class TodasLasCategoriasView(APIView):
    """Vista para obtener todas las categorías disponibles"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Obtener todas las categorías disponibles en el sistema"""
        from apps.perfiles.models import PerfilTrabajador
        
        # Obtener el diccionario de categorías del modelo
        categorias_dict = dict(PerfilTrabajador.CATEGORIAS)
        
        # Formatear como lista con id y nombre
        result = [
            {'id': code, 'nombre': nombre}
            for code, nombre in categorias_dict.items()
        ]
        
        return Response(result)


class RecomendacionesView(APIView):
    """Vista para obtener recomendaciones personalizadas"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Obtener trabajadores recomendados para el usuario"""
        limite = int(request.query_params.get('limite', 5))
        recomendaciones = RecomendacionService.recomendar_trabajadores(
            request.user,
            limite
        )
        
        serializer = PerfilTrabajadorListSerializer(recomendaciones, many=True)
        return Response(serializer.data)


class RankingView(APIView):
    """Vista para obtener ranking de trabajadores"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Obtener trabajadores por ranking"""
        from apps.perfiles.models import PerfilTrabajador
        
        perfiles = PerfilTrabajador.objects.filter(
            disponible=True,
            usuario__is_active=True
        )
        
        # Calcular ranking para cada perfil
        perfiles_con_ranking = []
        for perfil in perfiles:
            ranking = RankingService.calcular_ranking(perfil)
            perfiles_con_ranking.append({
                'perfil': perfil,
                'ranking': ranking
            })
        
        # Ordenar por ranking
        perfiles_con_ranking.sort(key=lambda x: x['ranking'], reverse=True)
        
        # Tomar top 20
        top_perfiles = [item['perfil'] for item in perfiles_con_ranking[:20]]
        
        serializer = PerfilTrabajadorListSerializer(top_perfiles, many=True)
        return Response(serializer.data)
