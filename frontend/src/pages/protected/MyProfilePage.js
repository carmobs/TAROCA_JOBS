import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCamera,
  FiX,
  FiUpload,
  FiUser,
  FiBriefcase,
  FiMapPin,
} from 'react-icons/fi';

const categoriaOptions = [
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

const municipioOptions = [
  'Colima', 'Manzanillo', 'Tecomán', 'Villa de Álvarez', 'Comala',
  'Coquimatlán', 'Cuauhtémoc', 'Ixtlahuacán', 'Minatitlán', 'Armería'
].map(value => ({ value, label: value }));

const modalidadOptions = [
  { value: 'domicilio', label: 'A domicilio' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
];

const defaultForm = {
  titulo_profesional: '',
  categorias: [],
  especialidades: '',
  experiencia_anos: '',
  descripcion: '',
  modalidades_servicio: [],
  tiempo_respuesta_horas: '24',
  certificaciones: '',
  idiomas: '',
  herramientas: '',
  ubicacion: '',
  zona_servicio: [],
  tarifa_hora: '',
  tarifa_minima: '',
  disponible: true,
  horario_disponibilidad: '',
};

function toCsv(value) {
  return Array.isArray(value) ? value.join(', ') : '';
}

function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState(defaultForm);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState(null);
  const [fotoPortadaFile, setFotoPortadaFile] = useState(null);
  const [fotoPortadaPreview, setFotoPortadaPreview] = useState(null);
  const [uploadingFotos, setUploadingFotos] = useState(false);

  const isWorker = user?.rol === 'trabajador';

  const { data: workerProfile, isLoading } = useQuery({
    queryKey: ['my-worker-profile'],
    enabled: isWorker,
    queryFn: async () => {
      const response = await api.get('/perfiles/trabajadores/mi_perfil/');
      return response.data;
    },
  });

  useEffect(() => {
    if (!workerProfile) return;

    setFormData({
      titulo_profesional: workerProfile.titulo_profesional || '',
      categorias: Array.isArray(workerProfile.categorias) && workerProfile.categorias.length
        ? workerProfile.categorias
        : workerProfile.categoria
          ? [workerProfile.categoria]
          : [],
      especialidades: toCsv(workerProfile.especialidades),
      experiencia_anos: workerProfile.experiencia_anos || '',
      descripcion: workerProfile.descripcion || '',
      modalidades_servicio: Array.isArray(workerProfile.modalidades_servicio) ? workerProfile.modalidades_servicio : [],
      tiempo_respuesta_horas: String(workerProfile.tiempo_respuesta_horas ?? 24),
      certificaciones: toCsv(workerProfile.certificaciones),
      idiomas: toCsv(workerProfile.idiomas),
      herramientas: toCsv(workerProfile.herramientas),
      ubicacion: workerProfile.ubicacion || '',
      zona_servicio: Array.isArray(workerProfile.zona_servicio) ? workerProfile.zona_servicio : [],
      tarifa_hora: workerProfile.tarifa_hora || '',
      tarifa_minima: workerProfile.tarifa_minima || '',
      disponible: workerProfile.disponible ?? true,
      horario_disponibilidad: workerProfile.horario_disponibilidad || '',
    });

    setPortfolioItems(workerProfile.portafolios || []);
    setFotoPerfilPreview(workerProfile.foto_perfil ? getMediaUrl(workerProfile.foto_perfil) : null);
    setFotoPortadaPreview(workerProfile.foto_portada ? getMediaUrl(workerProfile.foto_portada) : null);
  }, [workerProfile]);

  const handleFotoChange = (setterFile, setterPreview) => (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }
    setterFile(file);
    setterPreview(URL.createObjectURL(file));
  };

  const uploadFotos = async () => {
    if (!workerProfile?.id) return;
    if (!fotoPerfilFile && !fotoPortadaFile) return;
    setUploadingFotos(true);
    try {
      const formData = new FormData();
      if (fotoPerfilFile) formData.append('foto_perfil', fotoPerfilFile);
      if (fotoPortadaFile) formData.append('foto_portada', fotoPortadaFile);

      await api.patch(`/perfiles/trabajadores/${workerProfile.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Imágenes actualizadas');
      setFotoPerfilFile(null);
      setFotoPortadaFile(null);
      await queryClient.invalidateQueries({ queryKey: ['my-worker-profile'] });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudieron subir las imágenes');
    } finally {
      setUploadingFotos(false);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      if (workerProfile?.id) {
        const response = await api.put(`/perfiles/trabajadores/${workerProfile.id}/`, payload);
        return response.data;
      }

      const response = await api.post('/perfiles/trabajadores/', payload);
      return response.data;
    },
    onSuccess: async () => {
      toast.success('Perfil profesional guardado');
      await queryClient.invalidateQueries({ queryKey: ['my-worker-profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'No se pudo guardar el perfil');
    },
  });

  const uploadPortfolioMutation = useMutation({
    mutationFn: async ({ file, titulo, descripcion, tipo_media, orden }) => {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descripcion', descripcion);
      formData.append('tipo_media', tipo_media);
      formData.append('archivo', file);
      formData.append('orden', String(orden));

      const response = await api.post('/perfiles/portafolios/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: async () => {
      toast.success('Portafolio guardado');
      setSelectedFiles([]);
      await queryClient.invalidateQueries({ queryKey: ['my-worker-profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'No se pudo guardar el portafolio');
    },
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/perfiles/portafolios/${id}/`);
      return id;
    },
    onSuccess: async () => {
      toast.success('Elemento eliminado del portafolio');
      await queryClient.invalidateQueries({ queryKey: ['my-worker-profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'No se pudo eliminar el portafolio');
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await api.patch(`/perfiles/portafolios/${id}/`, payload);
      return response.data;
    },
    onSuccess: async () => {
      toast.success('Portafolio actualizado');
      await queryClient.invalidateQueries({ queryKey: ['my-worker-profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'No se pudo actualizar el portafolio');
    },
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleModalidad = (value) => {
    setFormData((prev) => ({
      ...prev,
      modalidades_servicio: prev.modalidades_servicio.includes(value)
        ? prev.modalidades_servicio.filter((item) => item !== value)
        : [...prev.modalidades_servicio, value],
    }));
  };

  const toggleCategoria = (value) => {
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(value)
        ? prev.categorias.filter((item) => item !== value)
        : [...prev.categorias, value],
    }));
  };

  const toggleZona = (value) => {
    setFormData((prev) => ({
      ...prev,
      zona_servicio: prev.zona_servicio.includes(value)
        ? prev.zona_servicio.filter((item) => item !== value)
        : [...prev.zona_servicio, value],
    }));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [
      ...prev,
      ...files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        titulo: file.name.replace(/\.[^.]+$/, ''),
        descripcion: '',
      })),
    ]);
  };

  const handleSelectedFileChange = (itemId, field, value) => {
    setSelectedFiles((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  const handleSelectedFileRemove = (itemId) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handlePortfolioItemChange = (itemId, field, value) => {
    setPortfolioItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  const handlePortfolioItemSave = (item) => {
    updatePortfolioMutation.mutate({
      id: item.id,
      payload: {
        titulo: item.titulo,
        descripcion: item.descripcion,
      },
    });
  };

  const handlePortfolioItemDelete = (itemId) => {
    if (!window.confirm('¿Eliminar este elemento del portafolio?')) return;
    deletePortfolioMutation.mutate(itemId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.categorias.length) {
      toast.error('Selecciona al menos una categoría');
      return;
    }

    const payload = {
      titulo_profesional: formData.titulo_profesional,
      categoria: formData.categorias[0] || '',
      categorias: formData.categorias,
      especialidades: formData.especialidades.split(',').map((item) => item.trim()).filter(Boolean),
      experiencia_anos: Number(formData.experiencia_anos || 0),
      descripcion: formData.descripcion,
      modalidades_servicio: formData.modalidades_servicio,
      tiempo_respuesta_horas: Number(formData.tiempo_respuesta_horas || 24),
      certificaciones: formData.certificaciones.split(',').map((item) => item.trim()).filter(Boolean),
      idiomas: formData.idiomas.split(',').map((item) => item.trim()).filter(Boolean),
      herramientas: formData.herramientas.split(',').map((item) => item.trim()).filter(Boolean),
      ubicacion: formData.ubicacion,
      zona_servicio: formData.zona_servicio,
      tarifa_hora: formData.tarifa_hora,
      tarifa_minima: formData.tarifa_minima,
      disponible: formData.disponible,
      horario_disponibilidad: formData.horario_disponibilidad,
    };

    const savedProfile = await updateProfileMutation.mutateAsync(payload);

    if (selectedFiles.length > 0 && savedProfile?.id) {
      for (const item of selectedFiles) {
        await uploadPortfolioMutation.mutateAsync({
          file: item.file,
          titulo: item.titulo,
          descripcion: item.descripcion,
          tipo_media: item.file.type.startsWith('video/') ? 'video' : 'imagen',
          orden: portfolioItems.length,
        });
      }
    }
  };

  const canEditPortfolio = isWorker;

  const portfolioCount = useMemo(() => portfolioItems.length + selectedFiles.length, [portfolioItems.length, selectedFiles.length]);

  if (!isWorker) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="text-red-500 hover:text-red-600 font-medium text-sm mb-6 flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" /> Volver
          </button>

          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <FiAlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu perfil público está listo</h1>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Tu cuenta actual es de cliente, así que no puedes configurar un portafolio propio.
                  Sí puedes ver el portafolio público de los trabajadores cuando revises sus perfiles.
                  Si quieres administrar portafolio y mostrar tus trabajos, primero debes cambiar tu cuenta a trabajador.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/register-worker')}
                    className="px-5 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                  >
                    Convertirme en trabajador
                  </button>
                  <button
                    onClick={() => navigate('/search')}
                    className="px-5 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition"
                  >
                    Ver trabajadores y portafolios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !workerProfile) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-6 text-center py-12 text-gray-600">
          Cargando tu perfil profesional...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="text-red-500 hover:text-red-600 font-medium text-sm mb-6 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi perfil profesional</h1>
          <p className="text-gray-600 mt-2">
            Configura tu perfil, tus zonas de servicio y tu portafolio. Los clientes solo pueden ver tu portafolio público, pero no modificarlo.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-6">
          <div>
            <p className="font-semibold text-gray-900 mb-2">Foto de portada</p>
            <div className="h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {fotoPortadaPreview ? (
                <img src={fotoPortadaPreview} alt="Portada" className="w-full h-full object-cover" />
              ) : workerProfile?.foto_portada ? (
                <img src={getMediaUrl(workerProfile.foto_portada)} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-gray-500">Sin portada</span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <label className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm font-medium">
                Seleccionar portada
                <input type="file" accept="image/*" onChange={handleFotoChange(setFotoPortadaFile, setFotoPortadaPreview)} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {fotoPerfilPreview ? (
                <img src={fotoPerfilPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : workerProfile?.foto_perfil ? (
                <img src={getMediaUrl(workerProfile.foto_perfil)} alt={workerProfile?.usuario?.nombre || 'Perfil'} className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Foto de perfil</p>
              <p className="text-sm text-gray-600 mb-2">JPG, PNG (máx. 5MB)</p>
              <div className="flex gap-2">
                <label className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm font-medium">
                  Seleccionar foto
                  <input type="file" accept="image/*" onChange={handleFotoChange(setFotoPerfilFile, setFotoPerfilPreview)} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {(fotoPerfilFile || fotoPortadaFile) && (
            <div>
              <button
                type="button"
                onClick={uploadFotos}
                disabled={uploadingFotos}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium disabled:opacity-50"
              >
                {uploadingFotos ? 'Subiendo...' : 'Guardar imágenes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                  <FiUser className="w-4 h-4 text-red-500" /> Información profesional
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Título profesional</label>
                    <input
                      name="titulo_profesional"
                      value={formData.titulo_profesional}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej. Técnico en plomería residencial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categorías que ofreces
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categoriaOptions.map((categoria) => (
                        <label key={categoria.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.categorias.includes(categoria.value)}
                            onChange={() => toggleCategoria(categoria.value)}
                            className="w-4 h-4 text-red-500 rounded"
                          />
                          <span className="text-gray-700">{categoria.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Años de experiencia</label>
                    <input
                      type="number"
                      min="0"
                      name="experiencia_anos"
                      value={formData.experiencia_anos}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Cuenta qué haces, cómo trabajas y qué te diferencia"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidades</label>
                    <input
                      name="especialidades"
                      value={formData.especialidades}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej. fugas, instalación de sanitarios, reparación de tuberías"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                  <FiBriefcase className="w-4 h-4 text-red-500" /> Modalidades y disponibilidad
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Modalidades de servicio</label>
                    <div className="flex flex-wrap gap-3">
                      {modalidadOptions.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => toggleModalidad(option.value)}
                          className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${formData.modalidades_servicio.includes(option.value)
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tiempo de respuesta (horas)</label>
                    <input
                      type="number"
                      min="1"
                      name="tiempo_respuesta_horas"
                      value={formData.tiempo_respuesta_horas}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Horario de disponibilidad</label>
                    <input
                      name="horario_disponibilidad"
                      value={formData.horario_disponibilidad}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Lunes a viernes 8am - 6pm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tarifa por hora</label>
                    <input
                      name="tarifa_hora"
                      value={formData.tarifa_hora}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej. 250"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tarifa mínima</label>
                    <input
                      name="tarifa_minima"
                      value={formData.tarifa_minima}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej. 150"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                  <FiMapPin className="w-4 h-4 text-red-500" /> Ubicación y zonas
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación actual</label>
                    <input
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ciudad o colonia"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Zonas de servicio</label>
                    <div className="grid grid-cols-2 gap-2">
                      {municipioOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.zona_servicio.includes(option.value)}
                            onChange={() => toggleZona(option.value)}
                            className="w-4 h-4 text-red-500 rounded"
                          />
                          <span className="text-gray-700 text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Certificaciones</label>
                    <textarea
                      name="certificaciones"
                      value={formData.certificaciones}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej. electricista certificado, manejo de gas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Idiomas</label>
                    <textarea
                      name="idiomas"
                      value={formData.idiomas}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej. Español, Inglés"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Herramientas</label>
                    <textarea
                      name="herramientas"
                      value={formData.herramientas}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ej. taladro, nivel láser, sierra"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending || uploadPortfolioMutation.isPending}
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/perfil/' + (workerProfile?.id || ''))}
                  className="px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition"
                  disabled={!workerProfile?.id}
                >
                  Ver perfil público
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiCamera className="w-4 h-4 text-red-500" /> Portafolio
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Solo los trabajadores pueden subir y administrar su portafolio. Los clientes solo pueden verlo de forma pública.
              </p>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-red-300 transition">
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
                  <FiUpload className="text-2xl text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Agregar fotos o videos</span>
                  <span className="text-xs text-gray-500">PNG, JPG o MP4</span>
                </label>
              </div>

              <div className="mt-4 space-y-3">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handlePortfolioItemDelete(item.id)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-1 shadow"
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      {item.tipo_media === 'video' ? (
                        item.archivo ? (
                          <video
                            src={getMediaUrl(item.archivo)}
                            controls
                            className="w-full h-40 object-cover rounded-lg bg-black"
                          />
                        ) : (
                          <div className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                            Video sin vista previa
                          </div>
                        )
                      ) : item.archivo ? (
                        <img
                          src={getMediaUrl(item.archivo)}
                          alt={item.titulo}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                          Imagen sin vista previa
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      <input
                        value={item.titulo}
                        onChange={(event) => handlePortfolioItemChange(item.id, 'titulo', event.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Título"
                      />
                      <textarea
                        value={item.descripcion || ''}
                        onChange={(event) => handlePortfolioItemChange(item.id, 'descripcion', event.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows="3"
                        placeholder="Descripción"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handlePortfolioItemSave(item)}
                          disabled={updatePortfolioMutation.isPending}
                          className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
                        >
                          Guardar cambios
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedFiles.map((item) => (
                  <div key={item.id} className="border border-red-200 rounded-lg p-3 bg-red-50/40">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleSelectedFileRemove(item.id)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-1 shadow"
                        aria-label="Quitar"
                        title="Quitar"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      {item.file.type.startsWith('video/') ? (
                        <video
                          src={item.preview}
                          controls
                          className="w-full h-40 object-cover rounded-lg bg-black"
                        />
                      ) : (
                        <img
                          src={item.preview}
                          alt={item.titulo}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <input
                      value={item.titulo}
                      onChange={(event) => handleSelectedFileChange(item.id, 'titulo', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                      placeholder="Título"
                    />
                    <textarea
                      value={item.descripcion}
                      onChange={(event) => handleSelectedFileChange(item.id, 'descripcion', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows="3"
                      placeholder="Descripción"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Resumen</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Portafolio visible: {portfolioCount} elementos</p>
                <p>Modalidades: {formData.modalidades_servicio.length || 0}</p>
                <p>Zona de servicio: {formData.zona_servicio.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {canEditPortfolio && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            Los clientes pueden consultar tu portafolio público, pero solo tú puedes configurarlo.
          </div>
        )}
      </div>
    </div>
  );
}
