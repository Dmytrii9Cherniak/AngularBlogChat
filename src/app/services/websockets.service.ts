import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketsService {
  private socket: WebSocket | null = null;

  connect(identifier: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.socket = new WebSocket(
        `ws://localhost:8080?identifier=${identifier}`
      );

      this.socket.onopen = () => {
        console.log('WebSocket з’єднання встановлено');
      };

      this.socket.onclose = () => {
        console.log('WebSocket з’єднання закрито');
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket помилка:', error);
      };

      this.socket.onmessage = (message) => {
        console.log('Повідомлення від WebSocket:', message.data);
      };
    }
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
      this.socket = null;
    }
  }

  updateConnection(userId: string): void {
    console.log('Оновлення WebSocket з sessionId на userId');
    this.disconnect();
    this.connect(userId);
  }
}
