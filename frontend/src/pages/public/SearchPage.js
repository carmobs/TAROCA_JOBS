import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  FiSearch,
  FiStar,
  FiMapPin,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import CustomSelect from '../../components/common/CustomSelect';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  const buildMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${apiRoot}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const normalizeList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };
  
  const [filters, setFilters] = useState({
    categoria: searchParams.get('categoria') || '',
    municipios: searchParams.get('municipio') ? [searchParams.get('municipio')] : [],
    min_calificacion: searchParams.get('min_calificacion') || '',
  });

  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = (currentFilters) => (
    Boolean(currentFilters.categoria) ||
    (Array.isArray(currentFilters.municipios) && currentFilters.municipios.length > 0) ||
    Boolean(currentFilters.min_calificacion)
  );

  const activeFilterCount = (currentFilters) => {
    let count = 0;
    if (currentFilters.categoria) count += 1;
    if (Array.isArray(currentFilters.municipios) && currentFilters.municipios.length > 0) count += 1;
    if (currentFilters.min_calificacion) count += 1;
    return count;
  };

  // Fetch categorías
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/busqueda/categorias-todas/');
      return normalizeList(response.data);
    },
  });

  // Fetch municipios
  const { data: municipiosData = [] } = useQuery({
    queryKey: ['municipios'],
    queryFn: async () => {
      const response = await api.get('/busqueda/municipios/');
      return normalizeList(response.data);
    },
  });

  const defaultMunicipios = [
    'Colima', 'Manzanillo', 'Tecomán', 'Villa de Álvarez', 'Comala',
    'Coquimatlán', 'Cuauhtémoc', 'Ixtlahuacán', 'Minatitlán', 'Armería'
  ];

  const defaultCategories = [
    { id: 'plomeria', nombre: 'Plomería' },
    { id: 'electricidad', nombre: 'Electricidad' },
    { id: 'carpinteria', nombre: 'Carpintería' },
    { id: 'albañileria', nombre: 'Albañilería' },
    { id: 'pintura', nombre: 'Pintura' },
    { id: 'jardineria', nombre: 'Jardinería' },
    { id: 'limpieza', nombre: 'Limpieza' },
    { id: 'mecanica', nombre: 'Mecánica' },
    { id: 'tecnologia', nombre: 'Tecnología' }
  ];

  const categoriasParaMostrar = categoriesData?.length ? categoriesData : defaultCategories;
  const municipiosParaMostrar = municipiosData?.length ? municipiosData : defaultMunicipios;

  // Fetch trabajadores con filtros (categoria + municipios al servidor)
  const { data: workersData = [], isLoading } = useQuery({
    queryKey: ['trabajadores', filters.categoria, filters.municipios.join(','), filters.min_calificacion],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.municipios.length) params.append('municipios', filters.municipios.join(','));
      // NO enviar min_calificacion al servidor - lo filtramos en cliente
      
      const response = await api.get(`/busqueda/trabajadores/?${params.toString()}`);
      return normalizeList(response.data);
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      categoria: '',
      municipios: [],
      min_calificacion: '',
    });
    setSearchText('');
  };

  // Filtrado adicional por texto en cliente (instant search)
  const filteredWorkers = useMemo(() => {
    return workersData.filter(worker => {
      // Filtro por búsqueda de texto
      const searchLower = searchText.toLowerCase();
      const nombre = `${worker.usuario?.nombre || ''} ${worker.usuario?.apellido || ''}`.toLowerCase();
      const descripcion = (worker.descripcion || '').toLowerCase();
      const searchMatch = nombre.includes(searchLower) || descripcion.includes(searchLower);

      // Filtro por calificación mínima
      let calificacionMatch = true;
      if (filters.min_calificacion) {
        const minCalif = parseFloat(filters.min_calificacion);
        const workerCalif = parseFloat(worker.calificacion_promedio || 0);
        calificacionMatch = workerCalif >= minCalif;
      }

      return searchMatch && calificacionMatch;
    });
  }, [workersData, searchText, filters.min_calificacion]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-red-500 hover:text-red-600 font-medium text-sm mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Encuentra trabajadores</h1>
          <p className="text-gray-600 mt-2">
            {filteredWorkers.length} de {workersData.length} profesionales disponibles
          </p>

          {/* BÚSQUEDA POR NOMBRE */}
          <div className="mt-6 relative">
            <FiSearch className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* FILTROS - SIDEBAR */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <FiFilter className="w-4 h-4" /> Filtros
                  {hasActiveFilters(filters) && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {activeFilterCount(filters)}
                    </span>
                  )}
                </h2>
                {(hasActiveFilters(filters) || searchText) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Categoría */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categoría
                </label>
                <CustomSelect
                  name="categoria"
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  options={[{ value: '', label: 'Todas' }, ...categoriasParaMostrar.map(c => ({ value: c.id, label: c.nombre }))]}
                  placeholder="Todas"
                />
              </div>

              {/* Municipio */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Municipio
                </label>
                <CustomSelect
                  name="municipios"
                  value={filters.municipios}
                  onChange={(e) => handleFilterChange('municipios', e.target.value)}
                  multiple
                  options={[{ value: '', label: 'Todos' }, ...municipiosParaMostrar.map(m => ({ value: m, label: m }))]}
                  placeholder="Todos los municipios"
                />
              </div>

              {/* Calificación */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Calificación mínima
                </label>
                <CustomSelect
                  name="min_calificacion"
                  value={filters.min_calificacion}
                  onChange={(e) => handleFilterChange('min_calificacion', e.target.value)}
                  options={[
                    { value: '', label: 'Cualquiera' },
                    { value: '3', label: '3+ ⭐' },
                    { value: '4', label: '4+ ⭐' },
                    { value: '4.5', label: '4.5+ ⭐' },
                  ]}
                  placeholder="Cualquiera"
                />
              </div>
            </div>
          </div>

          {/* RESULTADOS */}
          <div className="lg:col-span-3">
            {/* Toggle filtros en mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-6 w-full py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 flex items-center justify-center gap-2"
            >
              <FiFilter className="w-4 h-4" /> {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando trabajadores...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No se encontraron trabajadores</p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchText || Object.values(filters).some(v => v) 
                    ? 'Intenta cambiar tus filtros o búsqueda'
                    : 'No hay trabajadores disponibles'}
                </p>
                {(searchText || Object.values(filters).some(v => v)) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Limpiar búsqueda y filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden"
                  >
                    {/* Foto */}
                    <div className="h-32 bg-gradient-to-br from-red-100 to-blue-100 flex items-center justify-center">
                      {worker.foto_perfil ? (
                        <img
                          src={buildMediaUrl(worker.foto_perfil)}
                          alt={worker.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          👤
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{worker.nombre}</h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {worker.titulo_profesional || (Array.isArray(worker.modalidades_servicio) && worker.modalidades_servicio.length ? worker.modalidades_servicio.join(' · ') : 'Profesional')}
                          </p>
                        </div>
                        {worker.es_suscrito && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            Premium
                          </span>
                        )}
                      </div>

                      {/* Calificación */}
                      <div className="flex items-center gap-1 mb-3">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {worker.calificacion_promedio || 'Sin'} ⭐
                        </span>
                        <span className="text-xs text-gray-600">
                          ({worker.resenas_count || 0} reseñas)
                        </span>
                      </div>

                      {/* Municipio */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <FiMapPin className="w-4 h-4" />
                        {worker.municipio_base}
                      </div>

                      {/* Categorías */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {worker.categorias?.slice(0, 2).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                        {worker.categorias?.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{worker.categorias.length - 2} más
                          </span>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/perfil/${worker.id}`)}
                          className="flex-1 py-2 bg-gray-100 text-gray-900 font-semibold rounded hover:bg-gray-200 transition text-sm"
                        >
                          Ver perfil
                        </button>
                        <button
                          onClick={() => navigate(`/solicitar/${worker.id}`)}
                          className="flex-1 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition text-sm"
                        >
                          Solicitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
