import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUpload, FiArrowLeft } from 'react-icons/fi';
import CustomSelect from '../../components/common/CustomSelect';

export default function WorkerRegisterPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portafolio, setPortafolio] = useState([]);

  // Categorías disponibles
  const categorias = [
    { value: 'plomeria', label: 'Plomería' },
    { value: 'electricidad', label: 'Electricidad' },
    { value: 'carpinteria', label: 'Carpintería' },
    { value: 'albañileria', label: 'Albañilería' },
    { value: 'pintura', label: 'Pintura' },
    { value: 'jardineria', label: 'Jardinería' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'mecanica', label: 'Mecánica' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'otros', label: 'Otros' },
  ];

  const municipios = [
    'Colima', 'Manzanillo', 'Tecomán', 'Villa de Álvarez', 'Comala',
    'Coquimatlán', 'Cuauhtémoc', 'Ixtlahuacán', 'Minatitlán', 'Armería'
  ];

  const resolveNameParts = (source) => {
    const rawNombre = source?.nombre || source?.nombre_completo || '';
    const rawApellido = source?.apellido || '';

    if (rawApellido || !rawNombre.includes(' ')) {
      return {
        nombre: rawNombre,
        apellido: rawApellido,
      };
    }

    const [firstName, ...rest] = rawNombre.trim().split(/\s+/);
    return {
      nombre: firstName || rawNombre,
      apellido: rawApellido || rest.join(' '),
    };
  };

  // Estado del formulario - Cargar datos del sessionStorage si existen
  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem('workerRegisterData');
    const parsedData = savedData ? JSON.parse(savedData) : null;
    const initialNameParts = resolveNameParts(user || parsedData);
    
    return {
      // Paso 1: Datos básicos
      nombre: user?.nombre || parsedData?.nombre || initialNameParts.nombre || '',
      apellido: user?.apellido || parsedData?.apellido || initialNameParts.apellido || '',
      email: user?.email || parsedData?.email || '',
      telefono: user?.telefono || parsedData?.telefono || '',

      // Paso 2: Información profesional
      titulo_profesional: '',
      categorias: parsedData?.categorias || [],
      especialidades: [],
      experiencia_anos: '',
      descripcion: '',
      modalidades_servicio: [],
      tiempo_respuesta_horas: '24',
      certificaciones: '',
      idiomas: '',
      herramientas: '',

      // Paso 3: Tarifas
      tarifa_hora: '',
      tarifa_minima: '',

      // Paso 4: Ubicación
      ubicacion: '',
      zona_servicio: [],
    };
  });

  const isExistingUser = Boolean(user?.id);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle especialidades múltiples
  const handleEspecialidadToggle = (especialidad) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidad)
        ? prev.especialidades.filter(e => e !== especialidad)
        : [...prev.especialidades, especialidad]
    }));
  };

  const handleCategoriaToggle = (categoria) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter(item => item !== categoria)
        : [...prev.categorias, categoria]
    }));
  };

  // Handle zona_servicio múltiples
  const handleZonaToggle = (zona) => {
    setFormData(prev => ({
      ...prev,
      zona_servicio: prev.zona_servicio.includes(zona)
        ? prev.zona_servicio.filter(z => z !== zona)
        : [...prev.zona_servicio, zona]
    }));
  };

  const handleMultiFieldToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPortafolio(prev => [...prev, {
          id: Date.now(),
          file: file,
          preview: reader.result,
          titulo: file.name.replace(/\.[^.]+$/, ''),
          descripcion: ''
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePortafolioFieldChange = (itemId, field, value) => {
    setPortafolio(prev => prev.map(item => (
      item.id === itemId ? { ...item, [field]: value } : item
    )));
  };

  // Mutation para crear perfil de trabajador
  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/perfiles/trabajadores/', data);
      return response.data;
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error(`❌ Error al crear perfil: ${error.response?.data?.detail || error.message}`);
      setIsSubmitting(false);
    },
  });

  // Validar paso actual
  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return formData.nombre && formData.apellido && formData.email;
      case 2:
        return formData.titulo_profesional && formData.categorias.length > 0 && formData.experiencia_anos && formData.descripcion && formData.modalidades_servicio.length > 0;
      case 3:
        return formData.tarifa_hora && formData.tarifa_minima;
      case 4:
        return formData.ubicacion && formData.zona_servicio.length > 0;
      default:
        return false;
    }
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        titulo_profesional: formData.titulo_profesional,
        categoria: formData.categorias[0] || '',
        categorias: formData.categorias,
        experiencia_anos: formData.experiencia_anos,
        descripcion: formData.descripcion,
        modalidades_servicio: formData.modalidades_servicio,
        tiempo_respuesta_horas: formData.tiempo_respuesta_horas,
        certificaciones: formData.certificaciones
          ? formData.certificaciones.split(',').map(item => item.trim()).filter(Boolean)
          : [],
        idiomas: formData.idiomas
          ? formData.idiomas.split(',').map(item => item.trim()).filter(Boolean)
          : [],
        herramientas: formData.herramientas
          ? formData.herramientas.split(',').map(item => item.trim()).filter(Boolean)
          : [],
        tarifa_hora: formData.tarifa_hora,
        tarifa_minima: formData.tarifa_minima,
        ubicacion: formData.ubicacion,
        zona_servicio: formData.zona_servicio,
      };

        if (isAuthenticated) {
          const profileUpdatePayload = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
          };

          if (user?.rol !== 'trabajador') {
            profileUpdatePayload.rol = 'trabajador';
          }

          const roleResult = await updateUserProfile(profileUpdatePayload);
          if (!roleResult.success) {
            setIsSubmitting(false);
            return;
          }
        }

      const profile = await createProfileMutation.mutateAsync(submitData);

      if (portafolio.length > 0) {
        for (const item of portafolio) {
          const portfolioForm = new FormData();
          portfolioForm.append('titulo', item.titulo || 'Trabajo realizado');
          portfolioForm.append('descripcion', item.descripcion || '');
          portfolioForm.append('tipo_media', item.file.type.startsWith('video/') ? 'video' : 'imagen');
          portfolioForm.append('archivo', item.file);
          portfolioForm.append('orden', '0');

          await api.post('/perfiles/portafolios/', portfolioForm, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      toast.success(
        portafolio.length > 0
          ? `✅ Perfil creado y ${portafolio.length} elemento(s) de portafolio guardados`
          : '✅ Perfil de trabajador creado exitosamente'
      );

      if (profile?.id) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`❌ Error al completar el registro: ${error.response?.data?.detail || error.message}`);
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Debes estar registrado</h2>
          <p className="text-red-700 mb-6">Primero, crea tu cuenta como usuario</p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
          >
            Crear Cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom section-padding max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-4"
        >
          <FiArrowLeft /> Volver
        </button>
        <h1 className="text-3xl font-bold mb-2">Registra tu Perfil como Trabajador</h1>
        <p className="text-gray-600">Completa tu información profesional en {4 - currentStep + 1} pasos</p>
      </div>

      {/* Progress Indicators */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`flex-1 h-2 rounded-full transition-colors ${
              step <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        {/* PASO 1: Datos Básicos */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Datos Personales</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                readOnly={isExistingUser}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
        )}

        {/* PASO 2: Información Profesional */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Información Profesional</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título profesional *
              </label>
              <input
                type="text"
                name="titulo_profesional"
                value={formData.titulo_profesional}
                onChange={handleChange}
                placeholder="Ej: Técnico en plomería residencial"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-red-600 mb-3">
                Categorías que ofreces *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categorias.map((categoria) => (
                  <label key={categoria.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categorias.includes(categoria.value)}
                      onChange={() => handleCategoriaToggle(categoria.value)}
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-gray-700">{categoria.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Especialidades
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Reparación', 'Instalación', 'Mantenimiento', 'Asesoría', 'Diseño', 'Construcción'].map(esp => (
                  <label key={esp} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.especialidades.includes(esp)}
                      onChange={() => handleEspecialidadToggle(esp)}
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-gray-700">{esp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Años de Experiencia *
              </label>
              <input
                type="number"
                name="experiencia_anos"
                min="0"
                max="70"
                value={formData.experiencia_anos}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de tu Experiencia *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="5"
                placeholder="Cuéntanos sobre tu experiencia, logros y especialidades..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Modalidades de servicio *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['domicilio', 'presencial', 'remoto', 'urgencias'].map(modalidad => (
                  <label key={modalidad} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.modalidades_servicio.includes(modalidad)}
                      onChange={() => handleMultiFieldToggle('modalidades_servicio', modalidad)}
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-gray-700 capitalize">{modalidad}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de respuesta esperado (horas) *
              </label>
              <input
                type="number"
                name="tiempo_respuesta_horas"
                min="1"
                max="168"
                value={formData.tiempo_respuesta_horas}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
        )}

        {/* PASO 3: Tarifas */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Tarifas</h2>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">
                💡 Establece tus tarifas competitivamente. Puedes ajustarlas más adelante.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa por Hora ($) *
                </label>
                <input
                  type="number"
                  name="tarifa_hora"
                  min="0"
                  step="0.01"
                  value={formData.tarifa_hora}
                  onChange={handleChange}
                  placeholder="25.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa Mínima ($) *
                </label>
                <input
                  type="number"
                  name="tarifa_minima"
                  min="0"
                  step="0.01"
                  value={formData.tarifa_minima}
                  onChange={handleChange}
                  placeholder="50.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Ejemplo:</strong> Si cobras $25/hora pero tu trabajo mínimo es 2 horas, 
                la tarifa mínima sería $50.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificaciones (separadas por coma)
                </label>
                <input
                  type="text"
                  name="certificaciones"
                  value={formData.certificaciones}
                  onChange={handleChange}
                  placeholder="Ej: DC-3, NOM-002, Técnico certificado"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idiomas (separados por coma)
                </label>
                <input
                  type="text"
                  name="idiomas"
                  value={formData.idiomas}
                  onChange={handleChange}
                  placeholder="Ej: Español, Inglés"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Herramientas / Equipo (separados por coma)
              </label>
              <input
                type="text"
                name="herramientas"
                value={formData.herramientas}
                onChange={handleChange}
                placeholder="Ej: Taladro, Escalera, Detector de fugas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* PASO 4: Ubicación y Portafolio */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Ubicación y Portafolio</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación Actual *
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Calle Principal 123, Ciudad"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Zonas de Servicio (Selecciona al menos una) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {municipios.map(municipio => (
                  <label key={municipio} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.zona_servicio.includes(municipio)}
                      onChange={() => handleZonaToggle(municipio)}
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-gray-700">{municipio}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sube fotos o videos de tu portafolio (opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="portafolio-upload"
                />
                <label htmlFor="portafolio-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <FiUpload className="text-3xl text-gray-400" />
                  <p className="text-gray-600">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-sm text-gray-400">PNG, JPG, MP4 hasta 5MB cada uno</p>
                </label>
              </div>

              {/* Preview de portafolio */}
              {portafolio.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Elementos del portafolio ({portafolio.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portafolio.map(item => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="relative group">
                          {item.file.type.startsWith('video/') ? (
                            <video
                              src={item.preview}
                              controls
                              className="w-full h-40 object-cover rounded-lg bg-black"
                            />
                          ) : (
                            <img
                              src={item.preview}
                              alt="Preview"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => setPortafolio(prev => prev.filter(p => p.id !== item.id))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.titulo}
                          onChange={(e) => handlePortafolioFieldChange(item.id, 'titulo', e.target.value)}
                          placeholder="Título del trabajo"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <textarea
                          value={item.descripcion}
                          onChange={(e) => handlePortafolioFieldChange(item.id, 'descripcion', e.target.value)}
                          placeholder="Describe qué se hizo en este trabajo"
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          {item.file.type.startsWith('video/') ? 'Video' : 'Imagen'} · {Math.round(item.file.size / 1024)} KB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Atrás
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid()}
              className="ml-auto px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition font-medium"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isStepValid() || isSubmitting}
              className="ml-auto px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
            >
              {isSubmitting ? '⏳ Guardando...' : '✅ Completar Registro'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
