import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiArrowRight,
  FiAlertCircle,
  FiFilter,
} from 'react-icons/fi';
import CustomSelect from '../../components/common/CustomSelect';

export default function AvailableJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    categoria: '',
    municipio: '',
    prioridad: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const normalizeList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  // Fetch perfil del trabajador para saber su categoría
  const { data: workerProfile } = useQuery({
    queryKey: ['worker-profile', user?.id],
    queryFn: async () => {
      try {
        const response = await api.get('/perfiles/trabajadores/mi_perfil/');
        return response.data || null;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(user?.id),
  });

  const workerCategories = useMemo(() => {
    if (Array.isArray(workerProfile?.categorias) && workerProfile.categorias.length) {
      return workerProfile.categorias;
    }
    if (workerProfile?.categoria) {
      return [workerProfile.categoria];
    }
    return [];
  }, [workerProfile]);

  const matchesWorkerCategory = (jobCategoria) => {
    if (!jobCategoria || !workerCategories.length) return false;
    const normalizedJob = jobCategoria.toLowerCase();
    return workerCategories.some(cat => cat.toLowerCase() === normalizedJob);
  };

  // Fetch solicitudes abiertas
  const workerCategoriesKey = workerCategories.join('|');
  const { data: jobsData = [], isLoading } = useQuery({
    queryKey: ['available-jobs', workerCategoriesKey, filters],
    queryFn: async () => {
      const response = await api.get('/trabajos/trabajos/');
      const estadosAbiertos = ['abierto', 'abierta', 'activa'];
      const normalized = normalizeList(response.data);

      let filtered = normalized.filter(job => estadosAbiertos.includes(job.estado));
      if (workerCategories.length) {
        filtered = filtered.filter(job => matchesWorkerCategory(job.categoria));
      }
      if (filters.categoria) {
        filtered = filtered.filter(job => job.categoria === filters.categoria);
      }
      if (filters.municipio) {
        filtered = filtered.filter(job => job.municipio === filters.municipio);
      }
      if (filters.prioridad) {
        filtered = filtered.filter(job => job.prioridad === filters.prioridad);
      }

      return filtered;
    },
    enabled: Boolean(workerProfile),
  });

  // Fetch categorías para los filtros
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/busqueda/categorias-todas/');
      return response.data || [];
    },
  });

  // Fetch municipios
  const { data: municipiosData = [] } = useQuery({
    queryKey: ['municipios'],
    queryFn: async () => {
      const response = await api.get('/busqueda/municipios/');
      return response.data || [];
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
  const categoriasFiltradas = workerCategories.length
    ? categoriasParaMostrar.filter(c => workerCategories.includes(c.id))
    : categoriasParaMostrar;

  const hasActiveFilters = Boolean(filters.categoria || filters.municipio || filters.prioridad);

  const clearFilters = () => {
    setFilters({
      categoria: '',
      municipio: '',
      prioridad: '',
    });
  };

  // Agrupar por prioridad para mejor visualización
  const jobsByPriority = useMemo(() => {
    const grouped = {
      urgente: [],
      programado: [],
      normal: [],
    };
    jobsData.forEach(job => {
      const priority = job.prioridad || 'normal';
      if (grouped[priority]) {
        grouped[priority].push(job);
      }
    });
    return grouped;
  }, [jobsData]);

  if (!workerProfile) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-900 mb-2">Completa tu perfil primero</h2>
          <p className="text-yellow-700 mb-6">Necesitas registrarte como trabajador para ver las solicitudes disponibles</p>
          <button
            onClick={() => navigate('/register-worker')}
            className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700"
          >
            Registrarme como trabajador
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes disponibles</h1>
          <p className="text-gray-600 mt-2">
            Aquí están todas las solicitudes <strong>públicas</strong> de clientes que buscan trabajadores como tú. 
            Encuentra las que más te interesen y envía tu propuesta.
          </p>
        </div>

        {/* AVISO IMPORTANTE */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 text-sm">Cómo funciona</p>
            <p className="text-blue-800 text-sm mt-1">
              Ves una solicitud que te interesa → Haces clic en "Enviar propuesta" → 
              Propones un precio y detalles → El cliente decide si acepta → Si acepta, contactarán para negociar el pago.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* FILTROS */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <FiFilter className="w-4 h-4" /> Filtros
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold"
                  >
                    Limpiar
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
                  onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
                  options={[
                    { value: '', label: 'Todas' },
                    ...categoriasFiltradas.map(c => ({ value: c.id, label: c.nombre }))
                  ]}
                  placeholder="Todas"
                />
              </div>

              {/* Municipio */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Municipio
                </label>
                <CustomSelect
                  name="municipio"
                  value={filters.municipio}
                  onChange={(e) => setFilters(prev => ({ ...prev, municipio: e.target.value }))}
                  options={[
                    { value: '', label: 'Todos' },
                    ...municipiosParaMostrar.map(m => ({ value: m, label: m }))
                  ]}
                  placeholder="Todos"
                />
              </div>

              {/* Prioridad */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Prioridad
                </label>
                <CustomSelect
                  name="prioridad"
                  value={filters.prioridad}
                  onChange={(e) => setFilters(prev => ({ ...prev, prioridad: e.target.value }))}
                  options={[
                    { value: '', label: 'Todas' },
                    { value: 'urgente', label: '🔴 Urgente' },
                    { value: 'programado', label: '📅 Programado' },
                    { value: 'normal', label: '⚪ Normal' },
                  ]}
                  placeholder="Todas"
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
              <FiFilter className="w-4 h-4" /> {showFilters ? 'Ocultar' : 'Mostrar'} filtros
            </button>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando solicitudes...</p>
              </div>
            ) : jobsData.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FiBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No hay solicitudes disponibles</p>
                <p className="text-gray-500 text-sm mt-2">
                  Intenta cambiar los filtros o vuelve más tarde
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Urgentes */}
                {jobsByPriority.urgente.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                      🔴 Urgentes ({jobsByPriority.urgente.length})
                    </h2>
                    <div className="space-y-3">
                      {jobsByPriority.urgente.map(job => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Programados */}
                {jobsByPriority.programado.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                      📅 Programados ({jobsByPriority.programado.length})
                    </h2>
                    <div className="space-y-3">
                      {jobsByPriority.programado.map(job => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Normales */}
                {jobsByPriority.normal.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-600 mb-3 flex items-center gap-2">
                      ⚪ Normales ({jobsByPriority.normal.length})
                    </h2>
                    <div className="space-y-3">
                      {jobsByPriority.normal.map(job => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada tarjeta de solicitud
function JobCard({ job }) {
  const navigate = useNavigate();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-700';
      case 'programado':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getModalityLabel = (modalidad) => {
    switch (modalidad) {
      case 'domicilio':
        return '🏠 A domicilio';
      case 'presencial':
        return '👥 Presencial';
      case 'remoto':
        return '💻 Remoto';
      default:
        return modalidad;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border-l-4 border-red-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{job.titulo}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.descripcion}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-4 ${getPriorityColor(job.prioridad)}`}>
          {job.prioridad?.toUpperCase() || 'NORMAL'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 py-3 border-y border-gray-200">
        <div className="text-sm">
          <p className="text-gray-600">Categoría</p>
          <p className="font-semibold text-gray-900">{job.categoria}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-600 flex items-center gap-1">
            <FiMapPin className="w-4 h-4" /> Municipio
          </p>
          <p className="font-semibold text-gray-900">{job.municipio}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-600">Modalidad</p>
          <p className="font-semibold text-gray-900">{getModalityLabel(job.modalidad)}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-600 flex items-center gap-1">
            <FiDollarSign className="w-4 h-4" /> Presupuesto
          </p>
          <p className="font-semibold text-gray-900">
            {job.presupuesto_estimado ? `$${job.presupuesto_estimado}` : 'A negociar'}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/enviar-propuesta/${job.id}`)}
        className="w-full py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
      >
        <FiArrowRight className="w-4 h-4" /> Enviar propuesta
      </button>
    </div>
  );
}
