/**
 * Componente para botón de autenticación con Google OAuth2
 * 
 * Uso:
 * <GoogleLoginButton onSuccess={handleLoginSuccess} onError={handleLoginError} />
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const { verifyToken } = useAuth();
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return; // No cargar script si falta client id

    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.google && GOOGLE_CLIENT_ID) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
          });

          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'outline', size: 'large', text: 'signin_with', width: '100%' }
          );
        }
      };
    };

    if (!window.google) loadGoogleScript();
    else if (GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleLogin });
      window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), { theme: 'outline', size: 'large', text: 'signin_with', width: '100%' });
    }
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleLogin = async (response) => {
    if (!response?.credential) return;
    try {
      const res = await api.post('/auth/google/', { id_token: response.credential });
      const data = res.data;

      // Guardar tokens en las mismas claves que usa el contexto
      if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.access);
        localStorage.setItem('refreshToken', data.tokens.refresh);
      }

      // Llamar a verifyToken para actualizar el user en contexto
      if (verifyToken) await verifyToken();

      if (onSuccess) onSuccess(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error durante login con Google:', error);
      if (onError) onError(error.response?.data || error);
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full">
        <button
          type="button"
          className="btn-outline w-full"
          onClick={() => {
            alert('Falta REACT_APP_GOOGLE_CLIENT_ID en el entorno. Añade REACT_APP_GOOGLE_CLIENT_ID a frontend/.env.local y reinicia el servidor.');
          }}
        >
          Entrar con Google (configurar)
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div id="google-signin-button" className="flex justify-center" />
    </div>
  );
};

export default GoogleLoginButton;
