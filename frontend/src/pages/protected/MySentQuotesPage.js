import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  FiBriefcase,
  FiMessageCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiMapPin,
  FiTrendingUp,
} from 'react-icons/fi';

export default function MySentQuotesPage() {
  const navigate = useNavigate();

  // Fetch propuestas enviadas por el trabajador
  const { data: quotesData = [], isLoading } = useQuery({
    queryKey: ['my-sent-quotes'],
    queryFn: async () => {
      const response = await api.get('/trabajos/cotizaciones/mis_propuestas/');
      return response.data || [];
    },
  });

  // Agrupar por estado
  const quotesByStatus = useMemo(() => {
    const grouped = {
      pendiente: [],
      aceptada: [],
      rechazada: [],
    };
    quotesData.forEach(quote => {
      const status = quote.estado || 'pendiente';
      if (grouped[status]) {
        grouped[status].push(quote);
      }
    });
    return grouped;
  }, [quotesData]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: quotesData.length,
    pendiente: quotesByStatus.pendiente.length,
    aceptada: quotesByStatus.aceptada.length,
    rechazada: quotesByStatus.rechazada.length,
  }), [quotesData, quotesByStatus]);

  // Calcular vigencia restante en horas
  const getHoursRemaining = (createdAt, vigenciaHoras) => {
    if (!createdAt || !vigenciaHoras) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffHours = diffMs / (1000 * 60 * 60);
    const remaining = vigenciaHoras - diffHours;
    return Math.max(0, Math.round(remaining));
  };

  const getVigenciaColor = (remaining, total) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Propuestas</h1>
          <p className="text-gray-600 mt-2">
            Todas las propuestas que has enviado a solicitudes públicas
          </p>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Pendientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendiente}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Aceptadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.aceptada}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Rechazadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rechazada}</p>
          </div>
        </div>

        {/* CONTENIDO */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando propuestas...</p>
          </div>
        ) : stats.total === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FiBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Aún no has enviado propuestas</p>
            <p className="text-gray-500 text-sm mt-2">
              Ve a "Solicitudes disponibles" para encontrar trabajos y enviar propuestas
            </p>
            <button
              onClick={() => navigate('/solicitudes-disponibles')}
              className="mt-6 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
            >
              Ver solicitudes disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* PENDIENTES */}
            {quotesByStatus.pendiente.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-yellow-600 mb-4 flex items-center gap-2">
                  <FiClock className="w-5 h-5" /> Pendientes ({quotesByStatus.pendiente.length})
                </h2>
                <div className="space-y-4">
                  {quotesByStatus.pendiente.map(quote => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      navigate={navigate}
                      getHoursRemaining={getHoursRemaining}
                      getVigenciaColor={getVigenciaColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ACEPTADAS */}
            {quotesByStatus.aceptada.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5" /> Aceptadas ({quotesByStatus.aceptada.length})
                </h2>
                <div className="space-y-4">
                  {quotesByStatus.aceptada.map(quote => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      navigate={navigate}
                      getHoursRemaining={getHoursRemaining}
                      getVigenciaColor={getVigenciaColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* RECHAZADAS */}
            {quotesByStatus.rechazada.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                  <FiXCircle className="w-5 h-5" /> Rechazadas ({quotesByStatus.rechazada.length})
                </h2>
                <div className="space-y-4">
                  {quotesByStatus.rechazada.map(quote => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      navigate={navigate}
                      getHoursRemaining={getHoursRemaining}
                      getVigenciaColor={getVigenciaColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada tarjeta de propuesta
function QuoteCard({ quote, navigate, getHoursRemaining, getVigenciaColor }) {
  const hoursRemaining = getHoursRemaining(quote.created_at, quote.vigencia_horas);
  const vigenciaColor = getVigenciaColor(hoursRemaining, quote.vigencia_horas);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700';
      case 'aceptada':
        return 'bg-green-100 text-green-700';
      case 'rechazada':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 hover:shadow-md transition ${
      quote.estado === 'aceptada'
        ? 'border-green-500'
        : quote.estado === 'rechazada'
        ? 'border-red-500'
        : 'border-yellow-500'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* Columna izquierda: Info del trabajo */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {quote.trabajo?.titulo}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {quote.trabajo?.descripcion}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-600">Cliente</p>
              <p className="font-semibold text-gray-900">
                {quote.trabajo?.cliente?.nombre}
              </p>
            </div>
            <div>
              <p className="text-gray-600 flex items-center gap-1">
                <FiMapPin className="w-4 h-4" /> Municipio
              </p>
              <p className="font-semibold text-gray-900">{quote.trabajo?.municipio}</p>
            </div>
            <div>
              <p className="text-gray-600">Categoría</p>
              <p className="font-semibold text-gray-900">{quote.trabajo?.categoria}</p>
            </div>
            <div>
              <p className="text-gray-600">Modalidad</p>
              <p className="font-semibold text-gray-900">
                {quote.trabajo?.modalidad === 'domicilio' ? '🏠 Domicilio' :
                 quote.trabajo?.modalidad === 'presencial' ? '👥 Presencial' :
                 '💻 Remoto'}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Tu propuesta */}
        <div className="bg-red-50 rounded-lg p-4 flex flex-col">
          <div className="mb-4">
            <p className="text-gray-600 text-sm">Tu propuesta</p>
            <p className="text-2xl font-bold text-red-600">
              ${quote.precio}
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-sm font-semibold text-center ${getStatusBadge(quote.estado)}`}>
            {quote.estado.charAt(0).toUpperCase() + quote.estado.slice(1)}
          </span>
        </div>
      </div>

      {/* Detalles de la propuesta */}
      <div className="py-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div>
          <p className="text-gray-600">Tiempo estimado</p>
          <p className="font-semibold text-gray-900">
            {quote.tiempo_estimado_horas ? `${quote.tiempo_estimado_horas}h` : '-'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Incluye materiales</p>
          <p className="font-semibold text-gray-900">
            {quote.incluye_materiales ? '✅ Sí' : '❌ No'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Vigencia</p>
          <p className={`font-semibold ${vigenciaColor}`}>
            {hoursRemaining > 0 ? `${hoursRemaining}h` : 'Expirada'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Enviada hace</p>
          <p className="font-semibold text-gray-900">
            {Math.floor((new Date() - new Date(quote.created_at)) / 86400000)}d
          </p>
        </div>
        <div>
          <p className="text-gray-600">Fecha estimada</p>
          <p className="font-semibold text-gray-900">
            {quote.fecha_estimada ? new Date(quote.fecha_estimada).toLocaleDateString('es-MX') : '-'}
          </p>
        </div>
      </div>

      {/* Descripción de la propuesta */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Tu descripción:</p>
        <p className="text-gray-700 text-sm">{quote.descripcion}</p>
      </div>

      {/* Botones de acción */}
      <div className="mt-6 flex gap-3">
        {quote.estado === 'aceptada' && (
          <>
            <button
              onClick={() => navigate('/chat')}
              className="flex-1 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <FiMessageCircle className="w-4 h-4" /> Contactar al cliente
            </button>
            <button
              onClick={() => navigate(`/mis-solicitudes/${quote.trabajo?.id}`)}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
            >
              <FiArrowRight className="w-4 h-4" /> Ver
            </button>
          </>
        )}
        {quote.estado === 'pendiente' && (
          <p className="text-sm text-gray-500 italic">Esperando respuesta del cliente...</p>
        )}
        {quote.estado === 'rechazada' && (
          <button
            onClick={() => navigate('/solicitudes-disponibles')}
            className="flex-1 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2"
          >
            <FiBriefcase className="w-4 h-4" /> Ver más solicitudes
          </button>
        )}
      </div>
    </div>
  );
}
