import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketsService } from '../../../services/websockets.service';
import { UserService } from '../../../services/user.service';
import { ChatService } from '../../../services/chat.service';
import { filter, map, Observable } from 'rxjs';
import { DifferentChatModel } from '../../../models/chat/different.chat.model';
import { MessageChatModel } from '../../../models/chat/message.chat.model';
import { FormHelper } from '../../../helpers/form-helper';
import { WebsocketEventType } from '../../../enums/websocket-event-types';
import { IncomingMessageModel } from '../../../models/chat/incoming.message.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  username = '';
  messages: MessageChatModel[] = [];
  chats: Observable<DifferentChatModel[]>;
  currentUserId: number;
  selectedChatId: number;
  recipientUserId: number | null = null;
  hoveredMessageId: number | null = null;
  editedMessageId: number | null = null;
  hoveredDifferentChatId: number | null = null;
  formHelper: FormHelper;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private wsService: WebsocketsService,
    private router: Router,
    private userService: UserService,
    private chatService: ChatService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createChatForm();

    this.userService.userProfileData.subscribe((value) => {
      if (value?.userId) {
        this.currentUserId = value.userId;
      }
    });

    this.chats = this.chatService.requestChatList();

    this.route.queryParams.subscribe((params) => {
      const chatId = +params['chatId'];
      const userId = +params['userId'];
      this.username = params['username'] || '';

      if (chatId) {
        this.selectChat(chatId);
      } else if (userId) {
        this.recipientUserId = userId;
        this.findChatWithUser(userId);
      }
    });

    this.wsService.onMessage().subscribe((value) => {
      console.log(value, 'value');
    });

    this.listenForChatMessages();
  }

  selectChat(chatId: number): void {
    if (this.selectedChatId !== chatId) {
      this.selectedChatId = chatId;
      this.recipientUserId = null;

      this.chatService.requestChatList().subscribe((chats) => {
        const selectedChat = chats.find((chat) => chat.chat_id === chatId);
        if (selectedChat) {
          this.recipientUserId = this.getRecipientIdFromChat(selectedChat);
          this.username =
            selectedChat.chat_users
              .split(', ')
              .find((user) => user !== this.currentUserId.toString()) ||
            'Unknown User';
          this.updateQueryParams({ chatId, username: this.username });
        }
      });
      this.connectToChat(chatId);
    }
  }

  private connectToChat(chatId: number): void {
    this.messages = [];

    this.chatService
      .requestChatMessages(chatId)
      .pipe(
        map((response) => {
          console.log('📩 Відповідь з сервера:', response);
          return (
            response?.messages?.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            ) || []
          );
        })
      )
      .subscribe({
        next: (sortedMessages) => {
          this.messages = sortedMessages;
          console.log('📩 Отримані повідомлення:', this.messages);
        },
        error: (err) => {
          console.error('❌ Помилка при отриманні повідомлень:', err);
        }
      });
  }

  sendMessage(): void {
    const message = this.formHelper.form.value.message;
    const recipientId =
      this.recipientUserId || this.getRecipientIdFromChat() || 0;

    this.chatService.sendChatMessage(
      [this.currentUserId, recipientId],
      this.currentUserId,
      this.username,
      message,
      this.selectedChatId
    );

    this.formHelper.form.reset();
  }

  private getRecipientIdFromChat(chat?: DifferentChatModel): number | null {
    if (chat) {
      const participants = chat.chat_participant_list?.split(',').map(Number);
      return participants?.find((id) => id !== this.currentUserId) || null;
    } else {
      const chat = this.messages.find(
        (msg) => msg.user_id !== this.currentUserId
      );
      return chat ? chat.user_id : null;
    }
  }

  editMessage(messageId: number, messageContent: string): void {
    this.editedMessageId = messageId;
    this.formHelper.form.patchValue({ message: messageContent });
  }

  cancelEdit(): void {
    this.editedMessageId = null;
    this.formHelper.form.reset();
  }

  confirmEdit(): void {
    const newMessageContent = this.formHelper.form.value.message;

    if (this.editedMessageId !== null && newMessageContent) {
      this.chatService.updateChatMessage(
        this.editedMessageId,
        newMessageContent
      );

      // Візуально оновити повідомлення у списку
      this.messages = this.messages.map((msg) =>
        msg.message_id === this.editedMessageId
          ? { ...msg, message: newMessageContent }
          : msg
      );

      this.cancelEdit();
    }
  }

  deleteMessage(messageId: number): void {
    this.chatService.deleteChatMessage(messageId);
    this.messages = this.messages.filter((msg) => msg.message_id !== messageId);
  }

  deleteChat(chatId: number): void {
    this.chatService.deleteDifferentChat(chatId);
    this.chats = this.chats.pipe(
      map((chatList) => chatList.filter((chat) => chat.chat_id !== chatId))
    );
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }

  private updateQueryParams(params: { [key: string]: any }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  private findChatWithUser(userId: number): void {
    this.chatService
      .requestChatList()
      .subscribe((chats: DifferentChatModel[]): void => {
        const chatWithUser = chats.find((chat: DifferentChatModel) =>
          chat.chat_participant_list?.split(',').map(Number).includes(userId)
        );
        if (chatWithUser) {
          this.selectChat(chatWithUser.chat_id);
        }
      });
  }

  listenForChatMessages(): void {
    this.wsService
      .onMessage()
      .pipe(
        filter(
          (message: any) =>
            message.type === WebsocketEventType.CHAT_MESSAGE ||
            message.type === WebsocketEventType.MESSAGE_DELETED
        )
      )
      .subscribe({
        next: (message) => this.handleIncomingMessage(message),
        error: (err) =>
          console.error('❌ Помилка при отриманні повідомлень:', err)
      });
  }

  handleIncomingMessage(message: IncomingMessageModel): void {
    if (!message) return;

    switch (message.type) {
      case WebsocketEventType.CHAT_MESSAGE:
        this.handleNewChatMessage(message);
        break;

      case WebsocketEventType.MESSAGE_DELETED:
        this.handleMessageDeleted(message);
        break;

      default:
        console.warn('🚫 Невідомий тип повідомлення:', message.type);
    }
  }

  handleNewChatMessage(message: IncomingMessageModel): void {
    if (!message || message.type !== WebsocketEventType.CHAT_MESSAGE) {
      return;
    }

    const incomingMessage: IncomingMessageModel = message;

    if (incomingMessage.chat_id === this.selectedChatId) {
      const isMessageExists = this.messages.some(
        (msg) =>
          msg.message === incomingMessage.message &&
          msg.timestamp === incomingMessage.timestamp
      );

      if (!isMessageExists) {
        this.messages.push({
          message_id: Date.now(),
          message: incomingMessage.message,
          timestamp: incomingMessage.timestamp || new Date().toISOString(),
          user_id: incomingMessage.sender_id,
          username: incomingMessage.username
        });
        console.log('💬 Додано нове повідомлення до чату:', incomingMessage);
      } else {
        console.warn('🔁 Повідомлення вже існує в списку, не додаємо ще раз.');
      }
    } else {
      console.log('❌ Повідомлення не для поточного чату, пропускаємо.');
    }
  }

  handleMessageDeleted(message: any): void {
    if (!message?.message_id) {
      console.warn(
        '🚫 Повідомлення для видалення не містить message_id:',
        message
      );
      return;
    }

    const messageIdToDelete = message.message_id;
    this.messages = this.messages.filter(
      (msg) => msg.message_id !== messageIdToDelete
    );
    console.log(`🗑️ Повідомлення з ID ${messageIdToDelete} видалено локально`);
  }
}
