"""
Consumers para WebSocket Chat
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.usuarios.models import Usuario
from .models import Conversacion, Mensaje


class ChatConsumer(AsyncWebsocketConsumer):
    """Consumer para chat en tiempo real"""
    
    async def connect(self):
        """Conectar usuario al chat"""
        self.conversacion_id = self.scope['url_route']['kwargs']['conversacion_id']
        self.room_group_name = f'chat_{self.conversacion_id}'
        
        # Unirse al grupo de la conversación
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """Desconectar usuario del chat"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recibir mensaje del WebSocket"""
        data = json.loads(text_data)
        mensaje_texto = data['mensaje']
        usuario_id = data['usuario_id']
        
        # Guardar mensaje en la base de datos
        mensaje = await self.guardar_mensaje(
            self.conversacion_id,
            usuario_id,
            mensaje_texto
        )
        
        # Enviar mensaje al grupo
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'mensaje': mensaje_texto,
                'usuario_id': usuario_id,
                'mensaje_id': mensaje['id'],
                'timestamp': mensaje['timestamp']
            }
        )
    
    async def chat_message(self, event):
        """Recibir mensaje del grupo y enviarlo al WebSocket"""
        await self.send(text_data=json.dumps({
            'mensaje': event['mensaje'],
            'usuario_id': event['usuario_id'],
            'mensaje_id': event['mensaje_id'],
            'timestamp': event['timestamp']
        }))
    
    @database_sync_to_async
    def guardar_mensaje(self, conversacion_id, usuario_id, contenido):
        """Guardar mensaje en la base de datos"""
        conversacion = Conversacion.objects.get(id=conversacion_id)
        usuario = Usuario.objects.get(id=usuario_id)
        
        mensaje = Mensaje.objects.create(
            conversacion=conversacion,
            remitente=usuario,
            contenido=contenido
        )
        
        return {
            'id': mensaje.id,
            'timestamp': mensaje.created_at.isoformat()
        }
