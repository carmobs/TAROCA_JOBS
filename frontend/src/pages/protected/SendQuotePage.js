import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function SendQuotePage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch detalles del trabajo
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get(`/trabajos/trabajos/${jobId}/`);
      return response.data;
    },
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    precio: '',
    descripcion: '',
    fecha_estimada: '',
    tiempo_estimado_horas: '',
    incluye_materiales: false,
    vigencia_horas: '24',
  });

  // Mutation para enviar cotización
  const sendQuoteMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/trabajos/trabajos/${jobId}/cotizaciones/`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('✅ Propuesta enviada exitosamente');
      navigate(`/mis-propuestas`);
    },
    onError: (error) => {
      console.error('Error:', error);
      const data = error.response?.data;
      let message = data?.error || data?.detail;
      if (!message && data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];
        if (Array.isArray(firstVal)) {
          message = `${firstKey}: ${firstVal[0]}`;
        } else if (firstVal) {
          message = `${firstKey}: ${firstVal}`;
        }
      }
      toast.error(`❌ Error: ${message || error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.precio) {
      toast.error('El precio propuesto es requerido');
      return;
    }
    if (parseFloat(formData.precio) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }
    if (!formData.descripcion.trim()) {
      toast.error('Incluye detalles sobre tu propuesta');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (formData.fecha_estimada && formData.fecha_estimada < today) {
      toast.error('La fecha estimada no puede ser anterior a hoy');
      return;
    }

    const payload = {
      precio: parseFloat(formData.precio),
      descripcion: formData.descripcion.trim(),
      incluye_materiales: formData.incluye_materiales,
      vigencia_horas: parseInt(formData.vigencia_horas),
    };
    if (formData.fecha_estimada) {
      payload.fecha_estimada = formData.fecha_estimada;
    }
    if (formData.tiempo_estimado_horas) {
      payload.tiempo_estimado_horas = parseInt(formData.tiempo_estimado_horas);
    }

    setIsSubmitting(true);
    sendQuoteMutation.mutate(payload);
  };

  if (jobLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-600">Cargando solicitud...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-red-500 hover:text-red-600 font-medium text-sm mb-4 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">Solicitud no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-6">
        
        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="text-red-500 hover:text-red-600 font-medium text-sm mb-6 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Volver
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enviar propuesta</h1>
          <p className="text-gray-600 mt-2">
            Esta es una solicitud <strong>pública</strong>. Otros trabajadores también pueden proponer. 
            El cliente elegirá la mejor propuesta.
          </p>
        </div>

        {/* RESUMEN DE LA SOLICITUD */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-red-500">
          <h2 className="font-bold text-gray-900 mb-2">{job.titulo}</h2>
          <p className="text-gray-600 text-sm mb-4">{job.descripcion.substring(0, 150)}...</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Categoría</p>
              <p className="font-semibold text-gray-900">{job.categoria}</p>
            </div>
            <div>
              <p className="text-gray-600">Municipio</p>
              <p className="font-semibold text-gray-900">{job.municipio}</p>
            </div>
          </div>
        </div>

        {/* AVISO IMPORTANTE */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 text-sm">Propón tu mejor precio</p>
            <p className="text-blue-800 text-sm mt-1">
              Tu propuesta compite con otros trabajadores. Si el cliente la acepta, 
              contactará para confirmar detalles finales (<strong>método de pago, fecha, horario, etc.</strong>). 
              La plataforma <strong>no maneja dinero</strong> — se negotia directamente.
            </p>
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          
          {/* Precio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Precio propuesto ($) *
            </label>
            <div className="flex items-center">
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-l-lg font-semibold">
                $
              </span>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Este es un presupuesto que propondrás. El cliente negocia directamente contigo.
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detalles de tu propuesta *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Cuéntale al cliente qué incluye tu propuesta, materiales, métodos, etc."
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.descripcion.length}/1000 caracteres
            </p>
          </div>

          {/* Grid 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tiempo estimado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiempo estimado (horas) (opcional)
              </label>
              <input
                type="number"
                name="tiempo_estimado_horas"
                value={formData.tiempo_estimado_horas}
                onChange={handleChange}
                placeholder="8"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Fecha estimada */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha estimada de inicio (opcional)
              </label>
              <input
                type="date"
                name="fecha_estimada"
                value={formData.fecha_estimada}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Incluye materiales */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="incluye_materiales"
                checked={formData.incluye_materiales}
                onChange={handleChange}
                className="w-4 h-4 text-red-500 rounded"
              />
              <span className="text-sm font-semibold text-gray-700">
                Mi propuesta incluye materiales/insumos
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Marca esta opción si el precio incluye los materiales necesarios
            </p>
          </div>

          {/* Vigencia */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vigencia de esta propuesta (horas)
            </label>
            <select
              name="vigencia_horas"
              value={formData.vigencia_horas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="6">6 horas</option>
              <option value="12">12 horas</option>
              <option value="24">24 horas (recomendado)</option>
              <option value="48">2 días</option>
              <option value="72">3 días</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Por cuánto tiempo es válida tu propuesta de precio
            </p>
          </div>

          {/* AVISO LEGAL */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-900">
              <strong>⚠️ Responsabilidad:</strong> Al enviar esta propuesta, confirmas que:
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                <li>El precio y detalles son precisos y realistas</li>
                <li>Estás disponible para realizar el trabajo en la fecha propuesta</li>
                <li>Negociarás el acuerdo de pago <strong>directamente</strong> con el cliente</li>
                <li>La plataforma no interviene en transacciones monetarias</li>
              </ul>
            </p>
          </div>

          {/* BOTONES */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || sendQuoteMutation.isPending}
              className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendQuoteMutation.isPending ? (
                <>
                  <span className="animate-spin">⏳</span> Enviando...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5" /> Enviar propuesta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
