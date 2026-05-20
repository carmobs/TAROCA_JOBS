import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FiBarChart2,
  FiBriefcase,
  FiMessageCircle,
  FiTrendingUp,
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const normalizeList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  // Fetch trabajos del usuario
  const { data: jobsData = [] } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: async () => {
      const response = await api.get('/trabajos/trabajos/');
      return normalizeList(response.data);
    },
  });

  // Fetch conversaciones
  const { data: conversationsData = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversaciones/');
      return normalizeList(response.data);
    },
  });

  const activeJobs = jobsData.filter(j => j.estado === 'abierta').length;
  const assignedJobs = jobsData.filter(j => j.estado === 'asignada').length;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user?.nombre}!
          </h1>
          <p className="text-gray-600 mt-2">Resumen de tu actividad</p>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Solicitudes activas */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Solicitudes Activas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeJobs}</p>
              </div>
              <FiBriefcase className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Solicitudes asignadas */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Asignadas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{assignedJobs}</p>
              </div>
              <FiBarChart2 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Conversaciones */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Conversaciones</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{conversationsData.length}</p>
              </div>
              <FiMessageCircle className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          {/* Total solicitudes */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Solicitudes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{jobsData.length}</p>
              </div>
              <FiTrendingUp className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Mi perfil</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {user?.rol === 'trabajador'
                    ? 'Configura tu perfil profesional y administra tu portafolio. Los clientes solo lo ven en modo público.'
                    : 'Tu cuenta actual es de cliente. Puedes ver perfiles y portafolios de trabajadores, pero no configurarlos hasta cambiar tu cuenta a trabajador.'}
                </p>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                {user?.rol === 'trabajador' ? 'Trabajador' : 'Cliente'}
              </div>
            </div>

            <button
              onClick={() => navigate(user?.rol === 'trabajador' ? '/mi-perfil' : '/register-worker')}
              className="mt-5 px-5 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
            >
              {user?.rol === 'trabajador' ? 'Editar perfil y portafolio' : 'Convertirme en trabajador'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Portafolio</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Solo los trabajadores pueden crear y administrar un portafolio propio. Cualquier persona puede ver el portafolio público de un trabajador para revisar su experiencia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOLICITUDES RECIENTES */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5" /> Mis Solicitudes
            </h2>

            {jobsData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No tienes solicitudes aún. ¡Crea una para encontrar trabajadores!
              </p>
            ) : (
              <div className="space-y-4">
                {jobsData.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1">{job.descripcion.substring(0, 100)}...</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-gray-500">
                          📍 {job.municipio}
                        </span>
                        <span className={`font-semibold ${
                          job.estado === 'abierta' ? 'text-blue-600' :
                          job.estado === 'asignada' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {job.estado.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 ml-4">
                      ${job.presupuesto_estimado || '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONVERSACIONES RECIENTES */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiMessageCircle className="w-5 h-5" /> Mensajes
            </h2>

            {conversationsData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Sin conversaciones
              </p>
            ) : (
              <div className="space-y-3">
                {conversationsData.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    <p className="font-semibold text-gray-900 text-sm">
                      {conv.otro_usuario?.nombre || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {conv.ultimo_mensaje}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
