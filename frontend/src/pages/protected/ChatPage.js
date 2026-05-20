import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft, FiSend, FiLoader } from 'react-icons/fi';

export default function ChatPage() {
  const { conversacionId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch conversaciones del usuario
  const { data: conversationsData = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversaciones/');
      return response.data;
    },
  });

  // Fetch mensajes si hay conversacionId
  const { data: messagesData = [] } = useQuery({
    queryKey: ['messages', conversacionId],
    queryFn: async () => {
      if (!conversacionId) return [];
      const response = await api.get(`/chat/conversaciones/${conversacionId}/mensajes/`);
      return response.data;
    },
    enabled: !!conversacionId,
  });

  // Actualizar mensajes cuando cambian
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Conectar a WebSocket
  useEffect(() => {
    if (!conversacionId || !token) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${window.location.host}/ws/chat/${conversacionId}/?token=${token}`;
      
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          setMessages(prev => [...prev, data.message]);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [conversacionId, token]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversacionId) return;

    setIsLoading(true);
    try {
      const response = await api.post(
        `/chat/conversaciones/${conversacionId}/mensajes/`,
        { contenido: newMessage }
      );
      
      // El mensaje ya viene en la respuesta
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedConversation = conversationsData.find(c => c.id === parseInt(conversacionId));

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* LISTA DE CONVERSACIONES - SIDEBAR */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsData.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Sin conversaciones</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {conversationsData.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    parseInt(conversacionId) === conv.id
                      ? 'bg-red-50 border-2 border-red-500'
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <p className="font-semibold text-gray-900 truncate">
                    {conv.otro_usuario?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-1">
                    {conv.ultimo_mensaje || 'Sin mensajes'}
                  </p>
                  {conv.no_leidos > 0 && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      {conv.no_leidos}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE CHAT */}
      <div className="flex-1 flex flex-col">
        {!conversacionId ? (
          // NO HAY CONVERSACIÓN SELECCIONADA
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FiArrowLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Selecciona una conversación para comenzar</p>
            </div>
          </div>
        ) : !selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* HEADER DE CHAT */}
            <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/chat')}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedConversation.otro_usuario?.nombre || 'Usuario'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedConversation.otro_usuario?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>Comienza una conversación</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.remitente?.id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isSent
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="break-words">{msg.contenido}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isSent ? 'text-red-100' : 'text-gray-600'
                          }`}
                        >
                          {new Date(msg.creado_en).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !newMessage.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
