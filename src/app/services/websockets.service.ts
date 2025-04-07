import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WebsocketsMessageModel } from '../models/websockets/websockets-message-model';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebsocketsService {
  private socket: WebSocket | null = null;
  private wsEventSubject = new Subject<WebsocketsMessageModel>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private isConnected = false;

  constructor() {}

  connect(token: string): void {
    const wsUrl = `ws://127.0.0.1:8000/ws/community?accessToken=${token}`;
    this.connectWithRetry(wsUrl);
  }

  private connectWithRetry(wsUrl: string, retryCount = 3): void {
    let attempt = 0;
    const connectSocket = () => {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.connectionStatus.next(true);
        console.log('✅ WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        const data: WebsocketsMessageModel = JSON.parse(event.data);
        this.wsEventSubject.next(data);
        console.log(data, 'data from subject');
      };

      this.socket.onerror = (event) =>
        console.error('❌ WebSocket error:', event);

      this.socket.onclose = () => {
        this.isConnected = false;
        this.connectionStatus.next(false);
        console.warn('⚠️ WebSocket connection closed');

        if (attempt < retryCount) {
          attempt++;
          setTimeout(connectSocket, 2000);
        } else {
          console.error('❌ Failed to reconnect after 3 attempts');
        }
      };
    };

    connectSocket();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: WebsocketsMessageModel): void {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected. Message not sent:', message);
    }
  }

  onMessage(): Observable<WebsocketsMessageModel> {
    return this.wsEventSubject.asObservable().pipe(shareReplay(1));
  }

  onConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}
