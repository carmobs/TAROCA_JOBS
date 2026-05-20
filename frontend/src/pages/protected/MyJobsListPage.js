import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { FiBriefcase, FiPlus, FiFilter } from 'react-icons/fi';

export default function MyJobsListPage() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('todas');

  // Fetch trabajos del usuario
  const { data: jobsData = [], isLoading } = useQuery({
    queryKey: ['my-jobs', filterStatus],
    queryFn: async () => {
      const response = await api.get('/trabajos/trabajos/');
      const jobs = response.data || [];
      
      if (filterStatus === 'todas') return jobs;
      return jobs.filter(j => j.estado === filterStatus);
    },
  });

  const stats = {
    total: jobsData.length,
    abiertas: jobsData.filter(j => j.estado === 'abierta').length,
    asignadas: jobsData.filter(j => j.estado === 'asignada').length,
    cerradas: jobsData.filter(j => j.estado === 'cerrada').length,
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Solicitudes</h1>
            <p className="text-gray-600 mt-2">
              Tus solicitudes son <strong>públicas</strong> y visibles para todos los trabajadores en la categoría. 
              Aquí ves las propuestas que reciben.
            </p>
          </div>
          <button
            onClick={() => navigate('/solicitar')}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" /> Nueva Solicitud
          </button>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Abiertas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.abiertas}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Asignadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.asignadas}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Cerradas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.cerradas}</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <FiFilter className="w-5 h-5 text-gray-600" />
            <button
              onClick={() => setFilterStatus('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'todas'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('abierta')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'abierta'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Abiertas ({stats.abiertas})
            </button>
            <button
              onClick={() => setFilterStatus('asignada')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'asignada'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Asignadas ({stats.asignadas})
            </button>
            <button
              onClick={() => setFilterStatus('cerrada')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'cerrada'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cerradas ({stats.cerradas})
            </button>
          </div>
        </div>

        {/* LISTA DE SOLICITUDES */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : jobsData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FiBriefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No hay solicitudes</p>
            <p className="text-gray-500 text-sm mt-2">
              Crea una solicitud para comenzar a recibir cotizaciones
            </p>
            <button
              onClick={() => navigate('/solicitar')}
              className="mt-6 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
            >
              Crear solicitud
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobsData.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/mis-solicitudes/${job.id}`)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{job.titulo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.estado === 'abierta' ? 'bg-blue-100 text-blue-700' :
                        job.estado === 'asignada' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.estado.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{job.descripcion}</p>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-gray-900">
                      ${job.presupuesto_estimado || 'A negociar'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">CATEGORÍA</p>
                    <p className="font-medium">{job.categoria?.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">MUNICIPIO</p>
                    <p className="font-medium">📍 {job.municipio}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">COTIZACIONES</p>
                    <p className="font-medium">{job.cotizaciones_count || 0} recibidas</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">CREADA</p>
                    <p className="font-medium">
                      {new Date(job.creada_en).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
