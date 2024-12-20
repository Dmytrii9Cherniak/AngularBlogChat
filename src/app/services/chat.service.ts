import { Injectable } from '@angular/core';
import { WebsocketsService } from './websockets.service';
import { WebsocketEventType } from '../enums/websocket-event-types';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map, shareReplay, tap } from 'rxjs/operators';
import { DifferentChatModel } from '../models/chat/different.chat.model';
import { MessageChatModel } from '../models/chat/message.chat.model';
import { WebsocketsMessageModel } from '../models/websockets/websockets-message-model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  chatsListSubject = new BehaviorSubject<DifferentChatModel[]>([]);
  private chatListRequested = false;

  constructor(private wsService: WebsocketsService) {
    this.listenForChatList();
  }

  private listenForChatList(): void {
    this.wsService
      .onMessage()
      .pipe(
        filter(
          (
            message: WebsocketsMessageModel
          ): message is WebsocketsMessageModel & {
            chats: DifferentChatModel[];
          } => message.type === WebsocketEventType.ALL_CHATS_LIST
        ),
        tap((message) => {
          console.log('Отримано список чатів:', message);
          this.chatsListSubject.next(message.chats || []);
        })
      )
      .subscribe();
  }

  requestChatList(): Observable<DifferentChatModel[]> {
    if (!this.chatListRequested) {
      this.wsService.sendMessage({ type: WebsocketEventType.GET_CHAT_LIST });
      this.chatListRequested = true;
    }
    return this.chatsListSubject.asObservable().pipe(shareReplay(1));
  }

  requestChatMessages(
    chatId: number
  ): Observable<{ messages: MessageChatModel[] }> {
    console.log(`📨 Відправка запиту на повідомлення чату з chatId:`, chatId);

    this.wsService.sendMessage({
      type: WebsocketEventType.GET_CHAT_MESSAGES,
      chat_id: chatId
    });

    return this.wsService.onMessage().pipe(
      tap((message) =>
        console.log('🟢 Отримано повідомлення від WebSocket:', message)
      ),
      filter(
        (message: any) => message.type === WebsocketEventType.CHAT_MESSAGES
      ),
      map((response) => {
        if (!Array.isArray(response.messages)) {
          console.warn('❌ Неправильний формат повідомлень:', response);
          return { messages: [] };
        }
        console.log('✅ Повідомлення після обробки:', response);
        return response;
      })
    );
  }

  sendChatMessage(
    participants: number[],
    senderId: number,
    senderName: string,
    message: string
  ): void {
    let bodyToSend = {
      type: WebsocketEventType.CHAT_MESSAGE,
      participants: participants.join(','),
      sender: senderId,
      sender_name: senderName,
      message: message
    };
    this.wsService.sendMessage(bodyToSend);
  }

  updateChatMessage(messageId: number, newMessageContent: string): void {
    this.wsService.sendMessage({
      type: WebsocketEventType.UPDATE_CHAT_MESSAGE,
      message_id: messageId,
      new_message_content: newMessageContent
    });
  }

  deleteChatMessage(messageId: number, chatId: number): void {
    this.wsService.sendMessage({
      type: WebsocketEventType.DELETE_CHAT_MESSAGE,
      message_id: messageId,
      chat_id: chatId
    });
  }

  deleteDifferentChat(chatId: number): void {
    this.wsService.sendMessage({
      type: WebsocketEventType.DELETE_DIFFERENT_CHAT,
      chat_id: chatId
    });
  }

  initializeChatList(): void {
    this.wsService.onConnectionStatus().subscribe((isConnected: boolean) => {
      if (isConnected && !this.chatListRequested) {
        this.requestChatList();
      }
    });
  }
}
