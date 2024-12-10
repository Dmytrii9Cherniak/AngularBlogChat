import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketsService {
  private sockets: { [key: string]: WebSocket } = {};

  /**
   * Підключення приватного та публічного WebSocket
   */
  connectPrivate(userId: string): void {
    const privateUrl = `ws://localhost:8000/ws/chat/notifications/${encodeURIComponent(userId)}`;
    const publicUrl = `ws://localhost:8000/ws/public_room?userId=${encodeURIComponent(userId)}`;

    this.createSocket(privateUrl, 'private');
    this.createSocket(publicUrl, 'public');
  }

  /**
   * З'єднання для індивідуального чату між користувачами
   */
  connectChat(
    user1Id: string,
    user2Id: string,
    onMessageCallback: (message: any) => void
  ): void {
    const [minId, maxId] = this.sortIds(user1Id, user2Id);
    const chatUrl = `ws://localhost:8000/ws/chat/${minId}/${maxId}/`;
    const chatType = `chat_${minId}_${maxId}`;

    this.createSocket(chatUrl, chatType, onMessageCallback);
  }

  /**
   * Відправлення повідомлення до чату
   */
  sendMessage(user1Id: string, user2Id: string, message: string): void {
    const [minId, maxId] = this.sortIds(user1Id, user2Id);
    const chatType = `chat_${minId}_${maxId}`;

    if (this.sockets[chatType]) {
      const payload = {
        senderId: user1Id,
        message
      };

      this.sockets[chatType].send(JSON.stringify(payload));
      console.log(`Повідомлення надіслано в ${chatType}:`, payload);
    } else {
      console.warn(`Сокет для ${chatType} не знайдено`);
    }
  }

  /**
   * Метод для створення WebSocket-з'єднання
   */
  private createSocket(url: string, type: string, onMessageCallback?: (message: any) => void): void {
    if (this.sockets[type]) {
      const existingSocket = this.sockets[type];

      if (existingSocket.readyState === WebSocket.OPEN) {
        console.warn(`${type} WebSocket вже підключено`);
        return;
      }

      if (existingSocket.readyState === WebSocket.CONNECTING) {
        console.warn(`${type} WebSocket все ще підключається`);
        return;
      }
    }

    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log(`${type} WebSocket підключено`);
    };

    socket.onclose = () => {
      console.log(`${type} WebSocket відключено`);
      delete this.sockets[type];
    };

    socket.onerror = (error) => {
      console.error(`${type} WebSocket помилка`, error);
    };

    socket.onmessage = (message) => {
      const parsedMessage = JSON.parse(message.data);
      console.log(`${type} WebSocket отримав повідомлення`, parsedMessage);
      if (onMessageCallback) {
        onMessageCallback(parsedMessage);
      }
    };

    this.sockets[type] = socket;
  }

  /**
   * Від'єднання чату між двома користувачами
   */
  disconnectChat(user1Id: string, user2Id: string): void {
    const [minId, maxId] = this.sortIds(user1Id, user2Id);
    const chatType = `chat_${minId}_${maxId}`;

    this.disconnectSocket(chatType);
  }

  /**
   * Від'єднання всіх з'єднань (під час розлогування)
   */
  disconnect(): void {
    for (const [type, socket] of Object.entries(this.sockets)) {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        console.log(`Закриття WebSocket з'єднання ${type}`);
        socket.close();
      }
      delete this.sockets[type];
    }
  }

  /**
   * Від'єднання конкретного WebSocket-з'єднання за типом
   */
  private disconnectSocket(type: string): void {
    if (this.sockets[type]) {
      this.sockets[type].close();
      delete this.sockets[type];
      console.log(`WebSocket для типу ${type} відключено`);
    }
  }

  /**
   * Допоміжний метод для сортування ID
   */
  private sortIds(id1: string, id2: string): [string, string] {
    return [id1, id2].map(id => parseInt(id, 10)).sort((a, b) => a - b).map(id => id.toString()) as [string, string];
  }
}
