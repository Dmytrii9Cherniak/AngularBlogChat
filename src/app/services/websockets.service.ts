import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebsocketsService {
  private sockets: { [key: string]: WebSocket } = {};

  connectPrivate(userId: string): void {
    const privateUrl = `ws://localhost:8000/ws/chat/notifications/${encodeURIComponent(userId)}/`;
    const publicUrl = `ws://localhost:8000/ws/public_room/?userId=${encodeURIComponent(userId)}`;

    // Створення приватного WebSocket
    this.createSocket(privateUrl, 'private');

    // Створення публічного WebSocket
    this.createSocket(publicUrl, 'public');
  }

  private createSocket(url: string, type: string): void {
    if (this.sockets[type]) {
      const existingSocket = this.sockets[type];

      if (existingSocket.readyState === WebSocket.OPEN) {
        console.warn(`${type} WebSocket already connected`);
        return;
      }

      if (existingSocket.readyState === WebSocket.CONNECTING) {
        console.warn(`${type} WebSocket is still connecting`);
        return;
      }
    }

    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log(`${type} WebSocket connection established`);
    };

    socket.onclose = (event) => {
      console.log(`${type} WebSocket connection closed:`, event);
      console.log('Reason:', event.reason, 'Code:', event.code);
      this.sockets[type] = null as any;
    };

    socket.onerror = (error) => {
      console.error(`${type} WebSocket error:`, error);
    };

    socket.onmessage = (message) => {
      console.log(`${type} WebSocket message received:`, message.data);
    };

    this.sockets[type] = socket;
  }

  disconnect(): void {
    for (const [type, socket] of Object.entries(this.sockets)) {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        console.log(`Closing ${type} WebSocket connection`);
        socket.close();
      }
      this.sockets[type] = null as any;
    }
  }
}
