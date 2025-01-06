import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';

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
  selectedChatId: number | null;
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
    private chatService: ChatService,
    private toastrService: ToastrService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createChatForm();

    this.userService.userProfileData.subscribe((value) => {
      if (value?.id) {
        this.currentUserId = value.id;
      }
    });

    this.chats = this.chatService.requestChatList();

    this.route.queryParams.subscribe((params) => {
      const chatId = +params['chatId'];
      const userId = +params['userId'];
      this.username = params['username'] || '';

      if (!chatId && !userId) {
        this.clearChatState(); // Очистити стан, якщо немає активного чату
      } else if (chatId) {
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

      // Очищення повідомлень перед завантаженням нового чату
      this.messages = [];

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
          console.log(this.messages, '123');
        }
      });
  }

  sendMessage(): void {
    const message = this.formHelper.form.value.message?.trim();

    if (!message) {
      return;
    }

    if (!this.selectedChatId && !this.recipientUserId) {
      return;
    }

    const recipientId = this.recipientUserId || this.getRecipientIdFromChat();
    if (!recipientId) {
      console.warn('❌ Неможливо визначити одержувача повідомлення.');
      return;
    }

    console.log('📤 Надсилаємо повідомлення:', {
      participants: [this.currentUserId, recipientId],
      sender: this.currentUserId,
      username: this.username,
      message: message,
      chat_id: this.selectedChatId
    });

    this.chatService.sendChatMessage(
      [this.currentUserId, recipientId],
      this.currentUserId,
      this.username,
      message
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
    if (!this.selectedChatId) {
      console.warn('❌ Немає вибраного чату для видалення повідомлення.');
      return;
    }

    this.chatService.deleteChatMessage(messageId, this.selectedChatId);
    this.messages = this.messages.filter((msg) => msg.message_id !== messageId);
  }

  deleteChat(chatId: number): void {
    this.chatService.deleteDifferentChat(chatId);

    // Видаляємо чат із локального списку чатів
    this.chats = this.chats.pipe(
      map((chatList) => chatList.filter((chat) => chat.chat_id !== chatId))
    );

    // Якщо видаляється обраний чат, скидаємо вибір чату та очищуємо повідомлення
    if (this.selectedChatId === chatId) {
      this.selectedChatId = null;
      this.messages = [];
      this.updateQueryParams({ chatId: null, username: null }); // Очищаємо параметри URL
    }
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
            message.type === WebsocketEventType.MESSAGE_DELETED ||
            message.type === WebsocketEventType.CHAT_CREATED
        )
      )
      .subscribe({
        next: (message) => this.handleIncomingMessage(message)
      });
  }

  handleIncomingMessage(message: IncomingMessageModel): void {
    if (!message) return;

    switch (message.type) {
      case WebsocketEventType.CHAT_MESSAGE:
        this.handleNewChatMessage(message);
        break;
      case WebsocketEventType.MESSAGE_UPDATED:
        if (message.message_id && message.new_content) {
          this.updateMessageContent(message.message_id, message.new_content);
        }
        break;
      case WebsocketEventType.MESSAGE_DELIVERED:
        if (message.message_id) {
          this.markMessageAsDelivered(message.message_id);
        }
        break;
      case WebsocketEventType.MESSAGE_IS_READ:
        if (message.messages) {
          const messageIds = message.messages.split(',').map(Number);
          this.markMessagesAsRead(messageIds);
        }
        break;
      case WebsocketEventType.FORWARD_MESSAGE:
        this.handleForwardedMessage(message);
        break;
      case WebsocketEventType.MESSAGE_PINNED:
        this.handlePinnedMessage(message);
        break;
      case WebsocketEventType.MESSAGE_DELETED:
        if (message.message_id) {
          this.handleMessageDeleted(message);
        }
        break;
      case WebsocketEventType.CHAT_CREATED:
        this.handleChatCreated(message);
        break;
      case WebsocketEventType.CHAT_DELETED:
        this.handleChatDeleted(message);
        break;
      default:
        console.warn('🚫 Невідомий тип повідомлення:', message.type);
    }
  }

  handlePinnedMessage(message: IncomingMessageModel): void {
    if (!message.message_id || !message.pin_owner_username) return;

    const pinnedMessage = this.messages.find(
      (msg) => msg.message_id === message.message_id
    );

    if (pinnedMessage) {
      pinnedMessage.is_pinned = true;
      this.toastrService.success(
        `Повідомлення закріплено користувачем ${message.pin_owner_username}`,
        'Закріплення повідомлення'
      );
    } else {
      console.warn('Закріплене повідомлення не знайдено.');
    }
  }

  updateMessageContent(messageId: number, newContent: string): void {
    const message = this.messages.find((msg) => msg.message_id === messageId);
    if (message) {
      message.message = newContent;
      this.toastrService.success('Повідомлення оновлено', 'Оновлення');
    } else {
      console.warn('Не вдалося знайти повідомлення для оновлення.');
    }
  }

  markMessageAsDelivered(messageId: number): void {
    const message = this.messages.find((msg) => msg.message_id === messageId);
    if (message) {
      message['status:'] = 'delivered';
      this.toastrService.info('Повідомлення доставлено', 'Статус');
    } else {
      console.warn('Не вдалося знайти повідомлення для оновлення статусу.');
    }
  }

  handleForwardedMessage(message: IncomingMessageModel): void {
    if (
      !message.message_content ||
      !message.sender_username ||
      !message.to_chat_id
    ) {
      return;
    }

    const forwardedMessage: MessageChatModel = {
      message_id: Date.now(),
      message: `${message.message_content} (переслано від ${message.sender_username})`,
      timestamp: new Date().toISOString(),
      user_id: message.sender_id!, // Гарантовано, що user_id не буде undefined
      username: message.sender_username,
      is_forwarded: true,
      reply_from_user: message.sender_id!
    };

    if (message.to_chat_id === this.selectedChatId) {
      this.messages.push(forwardedMessage);
    } else {
      this.toastrService.info(
        `Переслано повідомлення від ${message.sender_username}: "${message.message_content}"`,
        'Нове переслане повідомлення'
      );
    }
  }

  handleNewChatMessage(message: IncomingMessageModel): void {
    if (!message || message.type !== WebsocketEventType.CHAT_MESSAGE) {
      return;
    }

    const incomingMessage: IncomingMessageModel = message;

    // Якщо повідомлення для активного чату, просто додаємо його в список повідомлень
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
          user_id: Number(incomingMessage.sender_id),
          username: incomingMessage.username,
          reply_from_user: Number(incomingMessage.sender_id)
        });
      }
    }
    // Якщо чат неактивний, показуємо сповіщення Toastr
    else {
      this.toastrService.info(
        `Нове повідомлення від ${incomingMessage.username}: "${incomingMessage.message}"`,
        'Нове повідомлення'
      );
    }
  }

  handleChatCreated(message: any): void {
    if (!message?.chat_id) {
      return;
    }

    const newChat: DifferentChatModel = {
      chat_id: message.chat_id,
      chat_users: message.username,
      chat_participant_list: `${this.currentUserId},${message.sender_id}`,
      last_message_time: new Date().toISOString()
    };

    this.chats = this.chats.pipe(
      map((currentChats) => [...currentChats, newChat])
    );

    const isFromUserNavigation = !!this.recipientUserId && !this.selectedChatId;

    if (isFromUserNavigation) {
      this.selectChat(message.chat_id);
    }
  }

  handleMessageDeleted(message: any): void {
    if (!message?.message_id) {
      return;
    }

    const messageIdToDelete = message.message_id;
    this.messages = this.messages.filter(
      (msg) => msg.message_id !== messageIdToDelete
    );
  }

  private clearChatState(): void {
    this.selectedChatId = null;
    this.messages = [];
    this.username = '';
    this.recipientUserId = null;
  }

  handleChatDeleted(message: any): void {
    if (!message?.chat_id) {
      return;
    }

    const chatIdToDelete = message.chat_id;

    this.chats = this.chats.pipe(
      map((chatList) =>
        chatList.filter((chat) => chat.chat_id !== chatIdToDelete)
      )
    );

    if (this.selectedChatId === chatIdToDelete) {
      this.selectedChatId = null;
      this.messages = [];
      this.updateQueryParams({ chatId: null, username: null });
    }
  }

  markMessagesAsRead(messageIds: number[]): void {
    messageIds.forEach((id) => {
      const message = this.messages.find((msg) => msg.message_id === id);
      if (message) {
        message['status:'] = 'read';
      }
    });
    this.toastrService.info('Повідомлення прочитано');
  }

  pinMessage(messageId: number): void {
    this.chatService.pinMessage(messageId, this.currentUserId, this.username);
    const message = this.messages.find((msg) => msg.message_id === messageId);
    if (message) {
      message.is_pinned = true;
      this.toastrService.success(
        'Повідомлення успішно закріплено.',
        'Закріплено'
      );
    }
  }

  openForwardModal(messageId: number, messageContent: string): void {
    // Тут можна інтегрувати модальне вікно (наприклад, Angular Material Dialog).
    const toChatId = prompt('Введіть ID чату, куди переслати повідомлення:');
    if (toChatId) {
      this.chatService.forwardMessage(
        messageId,
        messageContent,
        this.currentUserId,
        this.username,
        parseInt(toChatId, 10)
      );
      console.log(messageId);
      this.toastrService.info('Повідомлення переслано.', 'Пересилання');
    }
  }

  ngOnDestroy(): void {
    this.clearChatState();
  }
}
