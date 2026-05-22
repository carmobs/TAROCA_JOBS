import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, FaUser, FaComments, FaBell, FaBars, FaTimes, 
  FaSignOutAlt, FaTachometerAlt 
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleProfileClick = () => {
    setUserMenuOpen(false);
    navigate('/mi-perfil');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white border border-red-500 rounded-lg flex items-center justify-center">
              <span className="text-red-500 font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-xl text-gray-800">
              Taroca<span className="text-red-500">Jobs</span>
            </span>
          </Link>

          {/* Barra de búsqueda (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                placeholder="Buscar trabajadores o servicios..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </form>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-gray-700 hover:text-red-500 transition">
              Explorar
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/chat" className="text-gray-700 hover:text-red-500 transition relative">
                  <FaComments className="text-xl" />
                </Link>
                
                <button className="text-gray-700 hover:text-red-500 transition relative">
                  <FaBell className="text-xl" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                    rounded-full w-4 h-4 flex items-center justify-center">3</span>
                </button>
                
                <div className="relative">
                    <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-500 transition"
                  >
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.foto_perfil ? (
                        <img src={getMediaUrl(user.foto_perfil)} alt={user?.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <FaUser className="text-white text-sm" />
                      )}
                    </div>
                    <span className="font-medium">{user?.nombre}</span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2">
                      <Link
                        to={user?.rol === 'trabajador' ? '/dashboard' : '/register-worker'}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaTachometerAlt />
                        <span>{user?.rol === 'trabajador' ? 'Dashboard' : 'Convertirme en trabajador'}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <FaUser />
                        <span>Mi Perfil</span>
                      </button>
                      <Link
                        to="/mis-solicitudes"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaTachometerAlt />
                        <span>Mis Solicitudes</span>
                      </Link>
                      {user?.rol === 'trabajador' && (
                        <>
                          <Link
                            to="/solicitudes-disponibles"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FaTachometerAlt />
                            <span>Solicitudes disponibles</span>
                          </Link>
                          <Link
                            to="/mis-propuestas"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FaTachometerAlt />
                            <span>Mis propuestas</span>
                          </Link>
                        </>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 
                          flex items-center space-x-2"
                      >
                        <FaSignOutAlt />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-500 transition">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                name="search"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </form>
            
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to={user?.rol === 'trabajador' ? '/dashboard' : '/register-worker'} className="block py-2 text-gray-700">{user?.rol === 'trabajador' ? 'Dashboard' : 'Convertirme en trabajador'}</Link>
                <Link to="/chat" className="block py-2 text-gray-700">Mensajes</Link>
                <button onClick={handleProfileClick} className="block w-full text-left py-2 text-gray-700">
                  Mi Perfil
                </button>
                <Link to="/mis-solicitudes" className="block py-2 text-gray-700">Mis Solicitudes</Link>
                {user?.rol === 'trabajador' && (
                  <>
                    <Link to="/solicitudes-disponibles" className="block py-2 text-gray-700">Solicitudes disponibles</Link>
                    <Link to="/mis-propuestas" className="block py-2 text-gray-700">Mis propuestas</Link>
                  </>
                )}
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block py-2 text-gray-700">Iniciar Sesión</Link>
                <Link to="/register" className="block py-2 btn-primary text-center">Registrarse</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
