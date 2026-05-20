import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-900">404</h1>
          <p className="text-2xl font-bold text-gray-900 mt-4">Página no encontrada</p>
          <p className="text-gray-600 mt-2">
            Lo sentimos, la página que buscas no existe.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <FiHome className="w-5 h-5" /> Volver a inicio
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5" /> Página anterior
          </button>
        </div>
      </div>
    </div>
  );
}
