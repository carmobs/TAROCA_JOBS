import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FiSearch,
  FiStar,
  FiTool,
  FiGrid,
  FiBriefcase,
  FiTruck,
  FiTrendingUp,
  FiMapPin,
} from 'react-icons/fi';
import CustomSelect from '../../components/common/CustomSelect';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchCategory, setSearchCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const showWorkerCta = !user || user.rol !== 'trabajador';

  // Fetch categorías
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/busqueda/categorias-todas/');
      return response.data;
    },
  });

  // Fetch municipios
  const { data: municipiosData } = useQuery({
    queryKey: ['municipios'],
    queryFn: async () => {
      const response = await api.get('/busqueda/municipios/');
      return response.data;
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCategory) params.append('categoria', searchCategory);
    if (searchLocation) params.append('municipio', searchLocation);
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Categorías con iconos
  const categoryIcons = {
    Construcción: <FiTool className="text-xl" />,
    Diseño: <FiStar className="text-xl" />,
    'Soporte TI': <FiGrid className="text-xl" />,
    Culinaria: <span className="text-xl">🍳</span>,
    Transporte: <FiTruck className="text-xl" />,
    Ventas: <FiTrendingUp className="text-xl" />,
  };

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
    { id: 'tecnologia', nombre: 'Tecnología' },
    { id: 'cerrajeria', nombre: 'Cerrajería' }
  ];

  const categoriasParaMostrar = categoriesData?.length ? categoriesData : defaultCategories;
  const municipiosParaMostrar = municipiosData?.length ? municipiosData : defaultMunicipios;

  return (
    <div className="bg-white min-h-screen">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full mb-4">
              ⭐ Conecta Taroca Jobs
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              ¿Dónde encuentras trabajadores que están listos para ti?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conéctate con profesionales experimentados en tu municipio para tus necesidades.
            </p>
          </div>

          {/* BUSCADOR PRINCIPAL */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué servicio necesitas?
                </label>
                <CustomSelect
                  name="searchCategory"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  options={categoriasParaMostrar.map(c => ({ value: c.id, label: c.nombre }))}
                  placeholder="Selecciona una categoría"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Municipio
                </label>
                <CustomSelect
                  name="searchLocation"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  options={municipiosParaMostrar.map(m => ({ value: m, label: m }))}
                  placeholder="Selecciona municipio"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <FiSearch className="w-4 h-4" /> Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS POPULARES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Categorías más populares</h2>

          {categoriesLoading ? (
            <div className="text-center text-gray-500">Cargando categorías...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoriesData?.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSearchCategory(cat.id);
                    navigate(`/search?categoria=${cat.id}`);
                  }}
                  className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-left"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-lg mb-3">
                    {categoryIcons[cat.nombre] || <FiTool />}
                  </div>
                  <h3 className="font-semibold text-gray-900">{cat.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">Explorar →</p>
                </button>
              ))}

              {/* Card destacada */}
              <button
                onClick={() => navigate('/search')}
                className="p-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-left flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg">+200 Servicios</h3>
                  <p className="text-red-100 mt-1">Disponible ahora</p>
                </div>
                <span className="text-sm font-semibold mt-4 flex items-center gap-2">
                  <FiSearch className="w-4 h-4" /> Ver todo
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* TRABAJADORES DESTACADOS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-8">Profesionales destacados</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Más valorados', icon: '⭐', count: '150+', desc: 'Trabajadores con 5⭐' },
              { title: 'Verificados', icon: '✓', count: '500+', desc: 'Identidad confirmada' },
              { title: 'Disponibles hoy', icon: '📅', count: '320+', desc: 'Listos para comenzar' },
              { title: 'Premium', icon: '👑', count: '85+', desc: 'Suscriptores activos' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate('/search')}
                className="p-8 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-red-500 transition text-center"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-red-500 font-semibold text-lg mb-2">{item.count}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {showWorkerCta && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Eres trabajador?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Crea tu perfil, ofrece tus servicios y conecta con clientes locales en Colima.
            </p>
            <button
              onClick={() => navigate('/register?role=trabajador')}
              className="px-8 py-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
            >
              Crear perfil de trabajador
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Conecta</h3>
              <p className="text-gray-400 text-sm">Plataforma de conexión laboral local en Colima.</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4 text-gray-300">Para clientes</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><button className="hover:text-white">Buscar trabajadores</button></li>
                <li><button className="hover:text-white">Solicitar servicio</button></li>
                <li><button className="hover:text-white">Cómo funciona</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4 text-gray-300">Para trabajadores</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><button className="hover:text-white">Crear perfil</button></li>
                <li><button className="hover:text-white">Publicar servicio</button></li>
                <li><button className="hover:text-white">Crecimiento</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4 text-gray-300">Información</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><button className="hover:text-white">Términos</button></li>
                <li><button className="hover:text-white">Privacidad</button></li>
                <li><button className="hover:text-white">Contacto</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 Conecta Trabajadores. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
