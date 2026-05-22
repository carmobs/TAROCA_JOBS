"""
URLs para Búsqueda
"""
from django.urls import path
from .views import (
    BusquedaTrabajadoresView,
    CategoriasPopularesView,
    TodasLasCategoriasView,
    MunicipiosDisponiblesView,
    RecomendacionesView,
    RankingView
)

urlpatterns = [
    path('trabajadores/', BusquedaTrabajadoresView.as_view(), name='buscar-trabajadores'),
    path('categorias/', CategoriasPopularesView.as_view(), name='categorias-populares'),
    path('categorias-todas/', TodasLasCategoriasView.as_view(), name='todas-categorias'),
    path('municipios/', MunicipiosDisponiblesView.as_view(), name='municipios-disponibles'),
    path('recomendaciones/', RecomendacionesView.as_view(), name='recomendaciones'),
    path('ranking/', RankingView.as_view(), name='ranking'),
]
