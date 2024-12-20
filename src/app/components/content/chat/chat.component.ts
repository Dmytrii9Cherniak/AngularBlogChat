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
      if (value?.userId) {
        this.currentUserId = value.userId;
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

  // selectChat(chatId: number): void {
  //   if (this.selectedChatId !== chatId) {
  //     this.selectedChatId = chatId;
  //     this.recipientUserId = null;
  //
  //     this.chatService.requestChatList().subscribe((chats) => {
  //       const selectedChat = chats.find((chat) => chat.chat_id === chatId);
  //       if (selectedChat) {
  //         this.recipientUserId = this.getRecipientIdFromChat(selectedChat);
  //         this.username =
  //           selectedChat.chat_users
  //             .split(', ')
  //             .find((user) => user !== this.currentUserId.toString()) ||
  //           'Unknown User';
  //         this.updateQueryParams({ chatId, username: this.username });
  //       }
  //     });
  //     this.connectToChat(chatId);
  //   }
  // }

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
      case WebsocketEventType.MESSAGE_DELETED:
        this.handleMessageDeleted(message);
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
          user_id: incomingMessage.sender_id,
          username: incomingMessage.username
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

  ngOnDestroy(): void {
    this.clearChatState();
  }
}
