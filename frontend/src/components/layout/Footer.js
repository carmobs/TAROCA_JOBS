import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Sobre nosotros */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Taroca Jobs</h3>
            <p className="text-sm mb-4">
              Conectando a los mejores profesionales con clientes que necesitan servicios de calidad en Colima, México.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buscar" className="hover:text-primary-400 transition">Explorar Servicios</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition">Registrarse como Trabajador</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition">Iniciar Sesión</Link></li>
              <li><Link to="/ayuda" className="hover:text-primary-400 transition">Centro de Ayuda</Link></li>
            </ul>
          </div>

          {/* Columna 3: Categorías populares */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Categorías Populares</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buscar?categoria=plomeria" className="hover:text-primary-400 transition">Plomería</Link></li>
              <li><Link to="/buscar?categoria=electricidad" className="hover:text-primary-400 transition">Electricidad</Link></li>
              <li><Link to="/buscar?categoria=carpinteria" className="hover:text-primary-400 transition">Carpintería</Link></li>
              <li><Link to="/buscar?categoria=limpieza" className="hover:text-primary-400 transition">Limpieza</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-primary-400" />
                <span>Colima, México</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaPhone className="text-primary-400" />
                <span>+52 312 123 4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-primary-400" />
                <span>contacto@trabajadorescolima.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; {currentYear} Taroca Jobs. Todos los derechos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terminos" className="hover:text-primary-400 transition">Términos de Servicio</Link>
              <Link to="/privacidad" className="hover:text-primary-400 transition">Política de Privacidad</Link>
              <Link to="/cookies" className="hover:text-primary-400 transition">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
