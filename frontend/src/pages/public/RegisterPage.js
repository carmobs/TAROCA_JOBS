import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterPage = () => {
  const { register, isAuthenticated, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    password_confirm: '',
    rol: 'cliente'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const nameRegex = /[0-9]/;
    if (nameRegex.test(formData.nombre)) {
      alert('El nombre no debe contener números');
      return;
    }
    if (nameRegex.test(formData.apellido)) {
      alert('El apellido no debe contener números');
      return;
    }
    if (formData.telefono && !/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      alert('El teléfono solo debe contener números');
      return;
    }
    
    // Si seleccionó trabajador y ya tiene cuenta, solo actualizamos rol y seguimos con el perfil
    if (formData.rol === 'trabajador') {
      if (isAuthenticated) {
        const roleUpdate = await updateUserProfile({ rol: 'trabajador' });
        if (roleUpdate.success) {
          sessionStorage.setItem('workerRegisterData', JSON.stringify(formData));
          navigate('/register-worker');
        }
        return;
      }

      // Si no está autenticado, registramos primero sin redirigir y luego abrimos el flujo de trabajador
      setLoading(true);
      const result = await register(formData, { skipNavigate: true });
      setLoading(false);
      if (result?.success) {
        // Guardar datos adicionales para precarga en el siguiente paso
        sessionStorage.setItem('workerRegisterData', JSON.stringify(formData));
        navigate('/register-worker');
      }
      return;
    }
    
    setLoading(true);
    await register(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="mt-2 text-gray-600">Únete a la comunidad de Taroca Jobs</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de cuenta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer
                  hover:bg-gray-50 transition"
                  style={{
                    borderColor: formData.rol === 'cliente' ? '#0073e6' : '#e5e7eb'
                  }}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="cliente"
                    checked={formData.rol === 'cliente'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium">Busco Servicios</span>
                </label>
                <label className="flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer
                  hover:bg-gray-50 transition"
                  style={{
                    borderColor: formData.rol === 'trabajador' ? '#0073e6' : '#e5e7eb'
                  }}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="trabajador"
                    checked={formData.rol === 'trabajador'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium">Ofrezco Servicios</span>
                </label>
              </div>
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <div className="relative">
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Juan"
                  />
                  <FaUser className="absolute left-3 top-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <div className="relative">
                  <input
                    type="text"
                    name="apellido"
                    required
                    value={formData.apellido}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Pérez"
                  />
                  <FaUser className="absolute left-3 top-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="tu@email.com"
                />
                <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="312 123 4567"
                />
                <FaPhone className="absolute left-3 top-4 text-gray-400" />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Mínimo 8 caracteres"
                />
                <FaLock className="absolute left-3 top-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password_confirm"
                  required
                  minLength="8"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Repite tu contraseña"
                />
                <FaLock className="absolute left-3 top-4 text-gray-400" />
              </div>
            </div>

            {/* Términos */}
            <div>
              <label className="flex items-start">
                <input type="checkbox" required className="mt-1 mr-2" />
                <span className="text-sm text-gray-600">
                  Acepto los{' '}
                  <Link to="/terminos" className="text-primary-600 hover:text-primary-700">
                    Términos de Servicio
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacidad" className="text-primary-600 hover:text-primary-700">
                    Política de Privacidad
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
