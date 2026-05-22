import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar token al cargar
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          verifyToken();
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify/');
      setUser(response.data.user);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setUser(userData);
      
      toast.success(`¡Bienvenido, ${userData.nombre}!`);
      const targetRoute = userData?.rol === 'trabajador' ? '/dashboard' : '/';
      navigate(targetRoute);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al iniciar sesión';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData, options = {}) => {
    try {
      const response = await api.post('/auth/register/', userData);
      // backend returns { user: {...}, tokens: { access, refresh }, message }
      const newUser = response.data.user || response.data;
      const access = response.data.tokens?.access || response.data.access;
      const refresh = response.data.tokens?.refresh || response.data.refresh;

      if (access && refresh) {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
      }
      setUser(newUser);

      toast.success('¡Cuenta creada exitosamente!');
      if (!options.skipNavigate) {
        const targetRoute = newUser?.rol === 'trabajador' ? '/dashboard' : '/';
        navigate(targetRoute);
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.email?.[0] || 
                     error.response?.data?.detail || 
                     'Error al registrar usuario';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.info('Sesión cerrada');
    navigate('/');
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await api.patch('/usuarios/update_profile/', userData);
      setUser(prevUser => ({ ...prevUser, ...response.data }));
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'No se pudo actualizar el perfil';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyToken,
    logout,
    updateUser,
    updateUserProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
