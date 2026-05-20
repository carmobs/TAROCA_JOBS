"""
Servicios de búsqueda y algoritmos de matching
"""
from django.db.models import Q, F
from apps.perfiles.models import PerfilTrabajador


class BusquedaService:
    """Servicio para búsqueda y filtrado de trabajadores"""
    
    @staticmethod
    def buscar_trabajadores(query_params):
        """
        Buscar trabajadores según parámetros
        
        Args:
            query_params: Diccionario con parámetros de búsqueda
        
        Returns:
            QuerySet de PerfilTrabajador
        """
        queryset = PerfilTrabajador.objects.select_related('usuario').filter(
            usuario__is_active=True
        )
        
        # Búsqueda por texto
        texto = query_params.get('q', '').strip()
        if texto:
            queryset = queryset.filter(
                Q(descripcion__icontains=texto) |
                Q(especialidades__icontains=texto) |
                Q(usuario__nombre__icontains=texto) |
                Q(usuario__apellido__icontains=texto)
            )
        
        # Filtro por categoría
        categoria = query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        # Filtro por ubicación
        ubicacion = query_params.get('ubicacion')
        if ubicacion:
            queryset = queryset.filter(ubicacion__icontains=ubicacion)

        # Filtro por uno o varios municipios
        municipios_raw = query_params.get('municipios', '')
        if municipios_raw:
            municipios = [m.strip() for m in municipios_raw.split(',') if m.strip()]
            if municipios:
                municipio_query = Q()
                for municipio in municipios:
                    municipio_query |= Q(zona_servicio__contains=[municipio]) | Q(ubicacion__icontains=municipio)
                queryset = queryset.filter(municipio_query)
        
        # Filtro por zona de servicio
        zona = query_params.get('zona')
        if zona:
            queryset = queryset.filter(zona_servicio__contains=[zona])
        
        # Filtro por disponibilidad
        disponible = query_params.get('disponible')
        if disponible is not None:
            queryset = queryset.filter(disponible=disponible)
        
        # Filtro por calificación mínima
        calificacion_min = query_params.get('calificacion_min')
        if calificacion_min:
            try:
                queryset = queryset.filter(
                    calificacion_promedio__gte=float(calificacion_min)
                )
            except ValueError:
                pass
        
        # Filtro por rango de precio
        precio_min = query_params.get('precio_min')
        precio_max = query_params.get('precio_max')
        if precio_min:
            try:
                queryset = queryset.filter(tarifa_hora__gte=float(precio_min))
            except ValueError:
                pass
        if precio_max:
            try:
                queryset = queryset.filter(tarifa_hora__lte=float(precio_max))
            except ValueError:
                pass
        
        # Ordenamiento
        orden = query_params.get('orden', 'calificacion')
        if orden == 'calificacion':
            queryset = queryset.order_by('-calificacion_promedio', '-total_resenas')
        elif orden == 'precio_asc':
            queryset = queryset.order_by('tarifa_hora')
        elif orden == 'precio_desc':
            queryset = queryset.order_by('-tarifa_hora')
        elif orden == 'trabajos':
            queryset = queryset.order_by('-total_trabajos')
        elif orden == 'reciente':
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    @staticmethod
    def obtener_categorias_populares():
        """Obtener categorías más populares"""
        from django.db.models import Count
        
        # Obtener todas las categorías posibles
        categorias_dict = dict(PerfilTrabajador.CATEGORIAS)
        
        # Contar trabajadores por categoría
        categorias_con_count = PerfilTrabajador.objects.values('categoria').annotate(
            total=Count('id')
        ).order_by('-total')
        
        # Formatear como lista con id y nombre
        result = []
        for cat in categorias_con_count:
            categoria_code = cat['categoria']
            result.append({
                'id': categoria_code,
                'nombre': categorias_dict.get(categoria_code, categoria_code)
            })
        
        return result


class RecomendacionService:
    """Servicio para recomendaciones personalizadas"""
    
    @staticmethod
    def recomendar_trabajadores(usuario, limite=5):
        """
        Recomendar trabajadores basado en historial y preferencias
        
        Args:
            usuario: Usuario que solicita recomendaciones
            limite: Número máximo de recomendaciones
        
        Returns:
            QuerySet de PerfilTrabajador recomendados
        """
        # Por ahora, recomendar los mejor calificados y más activos
        # TODO: Implementar algoritmo ML basado en historial
        
        return PerfilTrabajador.objects.filter(
            disponible=True,
            usuario__is_active=True,
            calificacion_promedio__gte=4.0
        ).order_by('-calificacion_promedio', '-total_trabajos')[:limite]


class RankingService:
    """Servicio para ranking de trabajadores"""
    
    @staticmethod
    def calcular_ranking(perfil):
        """
        Calcular puntuación de ranking para un perfil
        
        Factores:
        - Calificación promedio (40%)
        - Total de trabajos (30%)
        - Verificaciones (20%)
        - Actividad reciente (10%)
        """
        score = 0.0
        
        # Calificación (40%)
        score += (perfil.calificacion_promedio / 5.0) * 40
        
        # Total trabajos (30% - máximo en 100 trabajos)
        trabajos_score = min(perfil.total_trabajos / 100.0, 1.0)
        score += trabajos_score * 30
        
        # Verificaciones (20%)
        verificaciones = 0
        if perfil.identidad_verificada:
            verificaciones += 1
        if perfil.domicilio_verificado:
            verificaciones += 1
        score += (verificaciones / 2.0) * 20
        
        # Actividad (10% - basado en disponibilidad)
        if perfil.disponible:
            score += 10
        
        return round(score, 2)
