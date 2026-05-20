import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  FiStar,
  FiMapPin,
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiMessageCircle,
  FiImage,
  FiVideo,
} from 'react-icons/fi';

const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

function buildMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiRoot}${path.startsWith('/') ? '' : '/'}${path}`;
}

const categoriaLabels = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  carpinteria: 'Carpintería',
  albañileria: 'Albañilería',
  pintura: 'Pintura',
  jardineria: 'Jardinería',
  limpieza: 'Limpieza',
  mecanica: 'Mecánica',
  tecnologia: 'Tecnología',
  otros: 'Otros',
};

export default function WorkerPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch perfil del trabajador
  const { data: worker, isLoading: workerLoading } = useQuery({
    queryKey: ['worker', id],
    queryFn: async () => {
      const response = await api.get(`/perfiles/trabajadores/${id}/`);
      return response.data;
    },
  });

  // Fetch reseñas
  const { data: reviewsData = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const response = await api.get(`/resenas/trabajador/${id}/`);
      return response.data;
    },
  });

  if (workerLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-red-500 hover:text-red-600 font-medium text-sm mb-4 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">Trabajador no encontrado</p>
        </div>
      </div>
    );
  }

  const portfolioItems = worker.portafolios || [];
  const zonaServicio = Array.isArray(worker.zona_servicio) ? worker.zona_servicio : [];
  const especialidades = Array.isArray(worker.especialidades) ? worker.especialidades : [];
  const modalidades = Array.isArray(worker.modalidades_servicio) ? worker.modalidades_servicio : [];
  const certificaciones = Array.isArray(worker.certificaciones) ? worker.certificaciones : [];
  const idiomas = Array.isArray(worker.idiomas) ? worker.idiomas : [];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="text-red-500 hover:text-red-600 font-medium text-sm mb-6 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Volver
        </button>

        {/* ENCABEZADO */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Portada */}
          <div className="h-40 bg-gradient-to-br from-red-500 to-red-700"></div>

          {/* Info Principal */}
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-start">
              
              {/* Foto */}
              <div className="w-32 h-32 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-4xl -mt-20 border-4 border-white shadow-md">
                {worker.foto_perfil ? (
                  <img
                    src={worker.foto_perfil}
                    alt={worker.usuario?.nombre}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  '👤'
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {worker.usuario?.nombre_completo || worker.usuario?.nombre || 'Profesional'}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      {categoriaLabels[worker.categoria] || worker.get_categoria_display || 'Servicio profesional'}
                    </p>
                  </div>
                  {worker.es_suscrito && (
                    <span className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg inline-block w-fit">
                      👑 Premium
                    </span>
                  )}
                </div>

                {/* Calificación y Ubicación */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {worker.calificacion_promedio || 'Sin calificación'}
                    </span>
                    <span className="text-gray-600">
                      ({worker.resenas_count || 0} reseñas)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMapPin className="w-5 h-5" />
                    {worker.ubicacion || 'Colima, México'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiBriefcase className="w-5 h-5" />
                    Responde en {worker.tiempo_respuesta_horas || 24}h
                  </div>
                  {worker.verificado && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FiCheck className="w-5 h-5" />
                      Verificado
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/solicitar/${worker.id}`)}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <FiBriefcase className="w-4 h-4" /> Solicitar servicio
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <FiMessageCircle className="w-4 h-4" /> Contactar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Descripción */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre este profesional</h2>
              <p className="text-gray-700 leading-relaxed">
                {worker.descripcion || 'Profesional experimentado en su área. Listo para ayudarte con tus necesidades.'}
              </p>
            </div>

            {/* Portafolio */}
            {portfolioItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiImage className="w-5 h-5 text-red-600" /> Portafolio reciente
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <div className="h-44 bg-gray-100">
                        {item.tipo_media === 'video' ? (
                          <video
                            src={buildMediaUrl(item.archivo)}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={buildMediaUrl(item.archivo)}
                            alt={item.titulo}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {item.tipo_media === 'video' ? (
                            <FiVideo className="text-red-600" />
                          ) : (
                            <FiImage className="text-red-600" />
                          )}
                          <h3 className="font-semibold text-gray-900">{item.titulo}</h3>
                        </div>
                        {item.descripcion && (
                          <p className="text-sm text-gray-600 leading-relaxed">{item.descripcion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Servicios */}
            {((especialidades.length > 0) || worker.categoria) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios que ofrece</h2>
                <div className="flex flex-wrap gap-3">
                  {especialidades.length > 0 ? especialidades.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg"
                    >
                      {typeof cat === 'string' ? cat : cat.nombre}
                    </span>
                  )) : (
                    <span className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg">
                      {categoriaLabels[worker.categoria] || worker.categoria || 'Servicio profesional'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {modalidades.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Modalidades de servicio</h2>
                <div className="flex flex-wrap gap-2">
                  {modalidades.map((item, idx) => (
                    <span key={idx} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium capitalize">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(certificaciones.length > 0 || idiomas.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Credenciales</h2>
                <div className="space-y-4">
                  {certificaciones.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Certificaciones</p>
                      <div className="flex flex-wrap gap-2">
                        {certificaciones.map((item, idx) => (
                          <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {idiomas.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Idiomas</p>
                      <div className="flex flex-wrap gap-2">
                        {idiomas.map((item, idx) => (
                          <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cobertura */}
            {zonaServicio.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cobertura geográfica</h2>
                <div className="flex flex-wrap gap-2">
                  {zonaServicio.map((mun, idx) => (
                    <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {mun}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reseñas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Reseñas ({reviewsData.length})
              </h2>
              
              {reviewsData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Sin reseñas aún</p>
              ) : (
                <div className="space-y-4">
                  {reviewsData.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.autor?.nombre || 'Usuario'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.calificacion
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.creada_en).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comentario}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* TARJETA DE INFO */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-4">Información de contacto</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div>
                  <p className="text-gray-600">Experiencia</p>
                  <p className="font-semibold text-gray-900">
                    {worker.experiencia_anos ? `${worker.experiencia_anos} años` : 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tarifa base</p>
                  <p className="font-semibold text-gray-900">
                    ${worker.tarifa_minima || worker.tarifa_hora || 'A negociar'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Disponibilidad</p>
                  <p className="font-semibold text-green-600">
                    {worker.disponible ? 'Disponible' : 'No disponible'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/solicitar/${worker.id}`)}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition mb-3"
              >
                Solicitar servicio
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Contactar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
