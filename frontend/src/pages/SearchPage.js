import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../components/common/CustomSelect';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const SearchPage = () => {
  const navigate = useNavigate();
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoria: '',
    calificacion_min: '',
    disponible: true
  });

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  const fetchTrabajadores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.calificacion_min) params.append('calificacion_min', filters.calificacion_min);
      if (filters.disponible) params.append('disponible', 'true');

      const response = await axios.get(`${API_URL}/api/busqueda/trabajadores/?${params}`);
      setTrabajadores(response.data.results || response.data);
    } catch (error) {
      console.error('Error al cargar trabajadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrabajadores();
  };

  const categorias = [
    'Plomería', 'Electricidad', 'Carpintería', 'Albañilería',
    'Jardinería', 'Limpieza', 'Pintura', 'Mecánica', 'Herrería'
  ];

  return (
    <div className="container-custom section-padding">
      <h1 className="text-3xl font-bold mb-6">Búsqueda de Trabajadores</h1>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <CustomSelect
              name="categoria"
              value={filters.categoria}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categorias.map(cat => ({ value: cat, label: cat }))
              ]}
              placeholder="Todas las categorías"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación Mínima
            </label>
            <CustomSelect
              name="calificacion_min"
              value={filters.calificacion_min}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'Cualquier calificación' },
                { value: '3', label: '3+ estrellas' },
                { value: '4', label: '4+ estrellas' },
                { value: '4.5', label: '4.5+ estrellas' }
              ]}
              placeholder="Cualquier calificación"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-2 text-gray-600">Cargando trabajadores...</p>
        </div>
      ) : trabajadores.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No se encontraron trabajadores con estos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trabajadores.map(trabajador => (
            <div key={trabajador.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-primary-500">
                  {trabajador.usuario?.nombre?.charAt(0) || 'T'}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-lg">
                    {trabajador.usuario?.nombre} {trabajador.usuario?.apellido}
                  </h3>
                  <p className="text-primary-600 font-medium">{trabajador.categoria}</p>
                </div>
              </div>

              {trabajador.descripcion && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {trabajador.descripcion}
                </p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="ml-1 font-semibold">
                    {trabajador.calificacion_promedio?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="ml-1 text-gray-500 text-sm">
                    ({trabajador.total_resenas || 0})
                  </span>
                </div>
                {trabajador.precio_hora && (
                  <span className="text-primary-600 font-bold">
                    ${trabajador.precio_hora}/hr
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/perfil/${trabajador.id}`)}
                  className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors text-sm"
                >
                  Ver Perfil
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm">
                  Contactar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProfilePage = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/perfiles/trabajadores/mi_perfil/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerfil(response.data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom section-padding text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="container-custom section-padding">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Completa tu Perfil</h2>
          <p className="text-gray-600 mb-6">Aún no has creado tu perfil de trabajador.</p>
          <button className="bg-primary-500 text-white py-2 px-6 rounded-md hover:bg-primary-600">
            Crear Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom section-padding">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32"></div>
        
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-primary-500">
              {perfil.usuario?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="ml-6 mb-4">
              <h1 className="text-3xl font-bold">
                {perfil.usuario?.nombre} {perfil.usuario?.apellido}
              </h1>
              <p className="text-primary-600 font-medium text-lg">{perfil.categoria}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-primary-500">
                {perfil.calificacion_promedio?.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Calificación</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-2xl font-bold text-primary-500">
                {perfil.total_resenas || 0}
              </div>
              <div className="text-sm text-gray-600">Reseñas</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-2xl font-bold text-primary-500">
                ${perfil.precio_hora || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Por Hora</div>
            </div>
          </div>

          {perfil.descripcion && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Sobre mí</h2>
              <p className="text-gray-700">{perfil.descripcion}</p>
            </div>
          )}

          {perfil.experiencia_anos && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Experiencia</h2>
              <p className="text-gray-700">{perfil.experiencia_anos} años de experiencia</p>
            </div>
          )}

          <div className="flex gap-4">
            <button className="bg-primary-500 text-white py-2 px-6 rounded-md hover:bg-primary-600">
              Editar Perfil
            </button>
            <button className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-200">
              Ver como Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChatPage = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversaciones();
  }, []);

  const fetchConversaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/chat/conversaciones/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversaciones(response.data.results || response.data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversacionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/chat/conversaciones/${conversacionId}/mensajes/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.results || response.data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const handleSelectChat = (conversacion) => {
    setSelectedChat(conversacion);
    fetchMessages(conversacion.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/chat/conversaciones/${selectedChat.id}/mensajes/`,
        { contenido: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages(selectedChat.id);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  if (loading) {
    return (
      <div className="container-custom section-padding text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom section-padding">
      <h1 className="text-3xl font-bold mb-6">Mensajes</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Lista de conversaciones */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {conversaciones.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                No tienes conversaciones
              </div>
            ) : (
              conversaciones.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectChat(conv)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === conv.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center font-bold">
                      {conv.otro_participante?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-semibold">{conv.otro_participante || 'Usuario'}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.ultimo_mensaje || 'Sin mensajes'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Header del chat */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-bold">{selectedChat.otro_participante}</h2>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-600">No hay mensajes</p>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.es_mio ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.es_mio
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{msg.contenido}</p>
                          <p className={`text-xs mt-1 ${
                            msg.es_mio ? 'text-primary-100' : 'text-gray-600'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input de mensaje */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                Selecciona una conversación para empezar a chatear
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export const DashboardPage = () => {
  const [stats, setStats] = useState({
    trabajos_activos: 0,
    mensajes_nuevos: 0,
    reseñas_pendientes: 0
  });

  useEffect(() => {
    // Simular datos del dashboard
    setStats({
      trabajos_activos: 0,
      mensajes_nuevos: 0,
      reseñas_pendientes: 0
    });
  }, []);

  return (
    <div className="container-custom section-padding">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Trabajos Activos</p>
              <p className="text-3xl font-bold text-primary-500">{stats.trabajos_activos}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mensajes Nuevos</p>
              <p className="text-3xl font-bold text-primary-500">{stats.mensajes_nuevos}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reseñas Pendientes</p>
              <p className="text-3xl font-bold text-primary-500">{stats.reseñas_pendientes}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
        <p className="text-gray-600">No hay actividad reciente para mostrar.</p>
      </div>
    </div>
  );
};

export const NotFoundPage = () => (
  <div className="container-custom section-padding text-center">
    <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
    <h2 className="text-2xl font-bold mb-4">Página No Encontrada</h2>
    <p className="text-gray-600">La página que buscas no existe.</p>
  </div>
);

export default SearchPage;
