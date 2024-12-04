import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebsocketsService {
  private socket: WebSocket | null = null;

  connectPublic(sessionId: string): void {
    const url = `ws://localhost:8000/ws/public_room/?sessionId=${sessionId}`;
    this.createSocket(url);
  }

  connectPrivate(userId: string): void {
    const url = `ws://localhost:8000/ws/private/?userId=${userId}`;
    this.createSocket(url);
  }

  private createSocket(url: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onmessage = (message) => {
      console.log('WebSocket message received:', message.data);
    };
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
      this.socket = null;
    }
  }
}
