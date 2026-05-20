import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaComments, FaStar } from 'react-icons/fa';

const HomePage = () => {
  const categorias = [
    { nombre: 'Plomería', icono: '🔧', color: 'bg-blue-100 text-blue-600' },
    { nombre: 'Electricidad', icono: '⚡', color: 'bg-yellow-100 text-yellow-600' },
    { nombre: 'Carpintería', icono: '🪚', color: 'bg-amber-100 text-amber-600' },
    { nombre: 'Albañilería', icono: '🧱', color: 'bg-gray-100 text-gray-600' },
    { nombre: 'Pintura', icono: '🎨', color: 'bg-purple-100 text-purple-600' },
    { nombre: 'Jardinería', icono: '🌱', color: 'bg-green-100 text-green-600' },
    { nombre: 'Limpieza', icono: '🧹', color: 'bg-pink-100 text-pink-600' },
    { nombre: 'Mecánica', icono: '🔩', color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Encuentra a los Mejores Profesionales en Colima
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Conecta con trabajadores calificados y confiables para tus proyectos
          </p>
          
          {/* Barra de búsqueda grande */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl p-4 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="¿Qué servicio necesitas?"
                className="flex-1 px-6 py-4 text-gray-800 rounded-lg focus:outline-none"
              />
              <Link 
                to="/buscar" 
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <FaSearch />
                <span>Buscar</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { label: 'Trabajadores', value: '500+' },
              { label: 'Clientes Satisfechos', value: '2,000+' },
              { label: 'Servicios Completados', value: '5,000+' },
              { label: 'Calificación Promedio', value: '4.8 ⭐' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Categorías Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categorias.map((cat, idx) => (
              <Link
                key={idx}
                to={`/buscar?categoria=${cat.nombre.toLowerCase()}`}
                className={`${cat.color} rounded-xl p-6 text-center hover:scale-105 
                  transition-transform duration-200 shadow-md hover:shadow-xl`}
              >
                <div className="text-4xl mb-3">{cat.icono}</div>
                <div className="font-semibold">{cat.nombre}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            ¿Cómo Funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <FaSearch className="text-5xl text-primary-500" />,
                title: '1. Busca',
                description: 'Encuentra el profesional que necesitas por categoría o ubicación'
              },
              {
                icon: <FaStar className="text-5xl text-primary-500" />,
                title: '2. Compara',
                description: 'Revisa perfiles, calificaciones y portafolios de trabajadores'
              },
              {
                icon: <FaComments className="text-5xl text-primary-500" />,
                title: '3. Contacta',
                description: 'Chatea directamente con el trabajador para acordar detalles'
              },
              {
                icon: <FaUserPlus className="text-5xl text-primary-500" />,
                title: '4. Contrata',
                description: 'Finaliza el servicio y deja tu reseña para ayudar a otros'
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-secondary-500 to-secondary-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Eres un Profesional?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a nuestra plataforma y conecta con clientes que necesitan tus servicios. 
            ¡Es gratis registrarse!
          </p>
          <Link to="/register" className="btn-primary bg-white text-secondary-600 hover:bg-gray-100">
            Registrarme como Trabajador
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
