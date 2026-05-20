import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import CustomSelect from '../../components/common/CustomSelect';

export default function CreateJobPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch datos del trabajador (para referencia)
  const { data: worker } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: async () => {
      const response = await api.get(`/perfiles/trabajadores/${workerId}/`);
      return response.data;
    },
    enabled: !!workerId,
  });

  // Fetch categorías para el formulario
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/busqueda/categorias-todas/');
      return response.data;
    },
  });

  // Fetch municipios
  const { data: municipiosData = [] } = useQuery({
    queryKey: ['municipios'],
    queryFn: async () => {
      const response = await api.get('/busqueda/municipios/');
      return response.data;
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
    { id: 'albanileria', nombre: 'Albañilería' },
    { id: 'pintura', nombre: 'Pintura' },
    { id: 'jardineria', nombre: 'Jardinería' },
    { id: 'limpieza', nombre: 'Limpieza' },
    { id: 'mecanica', nombre: 'Mecánica' },
    { id: 'tecnologia', nombre: 'Tecnología' }
  ];

  const categoriasParaMostrar = categoriesData?.length ? categoriesData : defaultCategories;
  const municipiosParaMostrar = municipiosData?.length ? municipiosData : defaultMunicipios;

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    municipio: '',
    modalidad: 'domicilio',
    prioridad: 'normal',
    presupuesto_estimado: '',
    fecha_deseada: '',
    fecha_maxima_respuesta: '',
    detalles_adicionales: '',
  });

  // Mutation para crear trabajo
  const createJobMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/trabajos/trabajos/', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('✅ Solicitud creada exitosamente');
      // Navegar a página de detalles del trabajo donde se verán cotizaciones
      navigate(`/mis-solicitudes/${data.id}`);
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error(`❌ Error al crear solicitud: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Verificar que usuario esté autenticado
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-2">Inicia sesión para continuar</h2>
        <p className="text-red-700 mb-6">Necesitas estar autenticado para crear una solicitud</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
          >
            Ir a login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('El título es requerido');
      return;
    }
    if (!formData.descripcion.trim()) {
      toast.error('La descripción es requerida');
      return;
    }
    if (!formData.categoria) {
      toast.error('Selecciona una categoría');
      return;
    }
    if (!formData.municipio) {
      toast.error('Selecciona un municipio');
      return;
    }

    setIsSubmitting(true);
    createJobMutation.mutate({
      ...formData,
      presupuesto_estimado: formData.presupuesto_estimado ? parseFloat(formData.presupuesto_estimado) : null,
    });
    setIsSubmitting(false);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Crear solicitud de servicio</h1>
          <p className="text-gray-600 mt-2">
            Tu solicitud será <strong>pública</strong> y visible para todos los trabajadores en esta categoría. 
            Ellos enviarán propuestas que podrás revisar y aceptar.
          </p>
        </div>

        {/* CÓMO FUNCIONA */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="text-blue-600 mt-1">ℹ️</div>
          <div>
            <p className="font-semibold text-blue-900 text-sm">Cómo funciona</p>
            <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
              <li>Publicas tu solicitud (se ve de inmediato en la plataforma)</li>
              <li>Trabajadores la ven y envían propuestas con precio y detalles</li>
              <li>Aceptas la mejor propuesta</li>
              <li>Negocias <strong>directamente</strong> con el trabajador (pago, detalles, fecha, etc.)</li>
            </ol>
          </div>
        </div>
        
        {worker && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <div className="text-red-600 mt-1">👤</div>
            <div>
              <p className="text-sm text-red-900">
                Esta solicitud la verá <strong>{worker.usuario?.nombre}</strong> y todos los trabajadores en esta categoría.
              </p>
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">

          {/* IMPORTANTE: Aviso sobre pagos */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900 font-semibold">⚠️ Recuerda: Nosotros solo conectamos</p>
            <p className="text-sm text-amber-800 mt-2">
              <strong>No manejamos dinero</strong>. Cualquier acuerdo sobre precio, método de pago y detalles del trabajo 
              se negotia <strong>directamente entre tú y el trabajador</strong> una vez aceptes su propuesta. 
              Usa métodos seguros (transferencia, efectivo, Mercado Pago, etc.).
            </p>
          </div>
          
          {/* Título */}
          <div>
              <label className="block text-sm font-semibold text-red-600 mb-2">
                Título del servicio *
              </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Reparación de puerta de madera"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength="200"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.titulo.length}/200 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
              <label className="block text-sm font-semibold text-red-600 mb-2">
                Descripción detallada *
              </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe lo que necesitas. Incluye detalles importantes que ayuden a los trabajadores a entender mejor tu solicitud."
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              maxLength="2000"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.descripcion.length}/2000 caracteres
            </p>
          </div>

          {/* Grid 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Categoría */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>
                <CustomSelect
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  options={categoriasParaMostrar.map(c => ({ value: c.id, label: c.nombre }))}
                  placeholder="Selecciona una categoría"
                />
            </div>

            {/* Municipio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Municipio *
              </label>
              <CustomSelect
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                options={municipiosParaMostrar.map(m => ({ value: m, label: m }))}
                placeholder="Selecciona un municipio"
              />
            </div>
          </div>

          {/* Modalidad y prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Modalidad del servicio
              </label>
              <CustomSelect
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                options={[
                  { value: 'domicilio', label: 'A domicilio' },
                  { value: 'presencial', label: 'Presencial' },
                  { value: 'remoto', label: 'Remoto' },
                ]}
                placeholder="Selecciona una modalidad"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prioridad
              </label>
              <CustomSelect
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'urgente', label: 'Urgente' },
                  { value: 'programado', label: 'Programado' },
                ]}
                placeholder="Selecciona la prioridad"
              />
            </div>
          </div>

          {/* Grid 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Presupuesto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Presupuesto estimado (opcional)
              </label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-l-lg font-semibold">
                  $
                </span>
                <input
                  type="number"
                  name="presupuesto_estimado"
                  value={formData.presupuesto_estimado}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Esto ayuda a filtrar cotizaciones relevantes
              </p>
            </div>

            {/* Fecha deseada */}
            <div>
                <label className="block text-sm font-semibold text-red-600 mb-2">
                  Fecha deseada (opcional)
                </label>
              <input
                type="date"
                name="fecha_deseada"
                value={formData.fecha_deseada}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Fecha máxima de respuesta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha máxima para recibir cotizaciones (opcional)
              </label>
              <input
                type="date"
                name="fecha_maxima_respuesta"
                value={formData.fecha_maxima_respuesta}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Detalles adicionales */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detalles adicionales (opcional)
            </label>
            <textarea
              name="detalles_adicionales"
              value={formData.detalles_adicionales}
              onChange={handleChange}
              placeholder="Información extra que sea relevante (materiales, preferencias, restricciones, etc.)"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              maxLength="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.detalles_adicionales.length}/1000 caracteres
            </p>
          </div>

          {/* INFO BOX */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-700 mb-2">¿Cómo funciona?</h3>
              <ol className="text-sm text-red-600 space-y-2 list-decimal list-inside">
              <li>Publicas tu solicitud con todos los detalles</li>
              <li>Los trabajadores la ven y envían cotizaciones</li>
              <li>Recibes ofertas con presupuestos y propuestas</li>
              <li>Contactas directamente con quien te interese</li>
              <li>Acuerdan los detalles y confirman el servicio</li>
            </ol>
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
              disabled={isSubmitting || createJobMutation.isPending}
              className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || createJobMutation.isPending ? '⏳ Creando...' : '✓ Crear solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
