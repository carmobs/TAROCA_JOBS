import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiCheckCircle,
  FiMessageCircle,
} from 'react-icons/fi';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  const buildMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${apiRoot}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Fetch detalles del trabajo
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get(`/trabajos/trabajos/${jobId}/`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Fetch cotizaciones del trabajo
  const { data: quotations = [] } = useQuery({
    queryKey: ['quotations', jobId],
    queryFn: async () => {
      const response = await api.get(`/trabajos/trabajos/${jobId}/cotizaciones/`);
      return response.data;
    },
  });

  // Mutation para aceptar cotización
  const acceptQuotationMutation = useMutation({
    mutationFn: async (quotationId) => {
      const response = await api.post(`/trabajos/cotizaciones/${quotationId}/aceptar/`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('✅ Cotización aceptada');
      queryClient.invalidateQueries({ queryKey: ['quotations', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.response?.data?.detail || error.message}`);
    },
  });

  if (jobLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-600">Cargando solicitud...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-600">Solicitud no encontrada</p>
      </div>
    );
  }

  const acceptedQuotation = quotations.find(q => q.estado === 'aceptada');

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Botón Volver */}
        <button
          onClick={() => navigate('/mis-solicitudes')}
          className="text-red-500 hover:text-red-600 font-medium text-sm mb-6 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Mis solicitudes
        </button>

        {/* ENCABEZADO */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.titulo}</h1>
              <p className="text-gray-600 mt-1">
                Creada hace {Math.floor((new Date() - new Date(job.created_at || job.creada_en)) / 86400000)} días
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
              job.estado === 'abierto'
                ? 'bg-blue-100 text-blue-700'
                : job.estado === 'completado'
                ? 'bg-green-100 text-green-700'
                : job.estado === 'asignado'
                ? 'bg-green-100 text-green-700'
                : job.estado === 'cancelado'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {job.estado.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-gray-600 text-sm">Categoría</p>
              <p className="font-semibold text-gray-900">
                {job.categoria?.nombre || job.categoria}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Municipio</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin className="w-4 h-4" /> {job.municipio}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Presupuesto estimado</p>
              <p className="font-semibold text-gray-900">
                ${job.presupuesto_estimado || 'A negociar'}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700 leading-relaxed">{job.descripcion}</p>
          </div>
        </div>

        {/* COTIZACIONES */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Propuestas de trabajadores ({quotations.length})
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Tu solicitud es <strong>pública</strong>. Aquí están todas las propuestas que ha enviado trabajadores interesados. 
            Revisa, compara y elige la mejor. <strong>Nosotros solo conectamos</strong> — los detalles finales se negocias directamente con el trabajador.
          </p>

          {acceptedQuotation && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <FiCheckCircle className="w-5 h-5" /> Propuesta aceptada
              </div>
              <p className="text-green-600 text-sm mt-2">
                Contacta al trabajador para acordar detalles finales (método de pago, fecha, horario, materiales, etc.). 
                Todas las demás propuestas han sido rechazadas automáticamente.
              </p>
            </div>
          )}

          {quotations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aún no hay cotizaciones</p>
              <p className="text-gray-500 text-sm mt-2">Los trabajadores las enviarán cuando vean tu solicitud</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Foto trabajador */}
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                        {quotation.trabajador?.foto_perfil ? (
                          <img
                            src={buildMediaUrl(quotation.trabajador.foto_perfil)}
                            alt={quotation.trabajador.usuario?.nombre}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>

                      {/* Info trabajador */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {quotation.trabajador?.usuario?.nombre}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {quotation.trabajador?.calificacion_promedio || 'Sin'} (
                            {quotation.trabajador?.resenas_count || 0} reseñas)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estado */}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ${
                      quotation.estado === 'aceptada'
                        ? 'bg-green-100 text-green-700'
                        : quotation.estado === 'rechazada'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {quotation.estado.charAt(0).toUpperCase() + quotation.estado.slice(1)}
                    </span>
                  </div>

                  {/* Presupuesto */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-gray-600 text-sm font-semibold">Propuesta de precio</p>
                    <p className="text-2xl font-bold text-red-600">${quotation.precio}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Válida por {quotation.vigencia_horas || 24} horas. Negocia directamente con el trabajador.
                    </p>
                  </div>

                  {/* Descripción propuesta */}
                  {quotation.descripcion && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Detalles de la propuesta</p>
                      <p className="text-gray-700">{quotation.descripcion}</p>
                    </div>
                  )}

                  {/* Detalles técnicos */}
                  {(quotation.tiempo_estimado_horas || quotation.incluye_materiales) && (
                    <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
                      {quotation.tiempo_estimado_horas && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">⏱️ Tiempo estimado:</span>
                          <span className="text-sm font-semibold text-gray-900">{quotation.tiempo_estimado_horas}h</span>
                        </div>
                      )}
                      {quotation.incluye_materiales && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">📦 Incluye:</span>
                          <span className="text-sm font-semibold text-gray-900">Materiales</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fecha */}
                  <p className="text-xs text-gray-500 mb-4">
                    Enviada {new Date(quotation.created_at).toLocaleDateString()}
                  </p>

                  {/* Acciones */}
                  {quotation.estado === 'pendiente' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/perfil/${quotation.trabajador.id}`)}
                        className="flex-1 py-2 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition"
                      >
                        Ver perfil
                      </button>
                      <button
                        onClick={() => acceptQuotationMutation.mutate(quotation.id)}
                        disabled={acceptQuotationMutation.isPending}
                        className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50" title="Marca como tu preferida y contacta al trabajador"
                      >
                        {acceptQuotationMutation.isPending ? '...' : 'Aceptar'}
                      </button>
                    </div>
                  )}
                  {quotation.estado === 'aceptada' && (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-sm text-green-700">
                          ✅ Propuesta aceptada. Ahora contacta al trabajador para acordar los detalles y forma de pago.
                        </p>
                      </div>
                      <button
                      onClick={() => navigate('/chat')}
                      className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <FiMessageCircle className="w-4 h-4" /> Contactar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
