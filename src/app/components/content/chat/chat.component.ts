import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketsService } from '../../../services/websockets.service';
import { UserService } from '../../../services/user.service';
import { ChatService } from '../../../services/chat.service';
import { Observable, Subscription } from 'rxjs';
import { DifferentChatModel } from '../../../models/chat/different.chat.model';
import { MessageChatModel } from '../../../models/chat/message.chat.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  public userNickname: string = '';
  public messageForm: FormGroup;
  public messages: MessageChatModel[] = [];
  public chats: Observable<DifferentChatModel[]>;
  public currentUserId: number = 0;
  public selectedChatId: number | null = null;
  public recipientUserId: number | null = null;
  private messageSubscription: Subscription | null = null;

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected wsService: WebsocketsService,
    protected router: Router,
    protected userService: UserService,
    protected chatService: ChatService
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Отримуємо id поточного користувача
    this.userService.userProfileData.subscribe((value) => {
      this.currentUserId = Number(value?.userId);
    });

    // Отримуємо queryParams (userId і userNickname)
    this.route.queryParams.subscribe((params) => {
      this.recipientUserId = params['userId'] ? Number(params['userId']) : null;
      this.userNickname = params['userNickname'] || '';

      if (this.recipientUserId) {
        console.log(
          `Написання повідомлення користувачу з userId: ${this.recipientUserId}`
        );
        this.selectedChatId = null;
      }
    });

    this.chats = this.chatService.requestChatList();
  }

  selectChat(chatId: number): void {
    if (this.selectedChatId !== chatId) {
      this.selectedChatId = chatId;
      this.messages = [];

      if (this.messageSubscription) {
        this.messageSubscription.unsubscribe();
      }

      this.updateQueryParams({ chatId });
      this.connectToChat(chatId);
    }
  }

  private connectToChat(chatId: number): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.messages = [];

    this.messageSubscription = this.chatService
      .requestChatMessages(chatId)
      .subscribe({
        next: (response: { messages: MessageChatModel[] }) => {
          if (response && Array.isArray(response.messages)) {
            this.messages = response.messages;
          }
        },
        error: (error: unknown) => {
          console.error('Помилка завантаження повідомлень:', error);
        }
      });
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const message = this.messageForm.value.message;
      const chatId = this.recipientUserId ?? this.selectedChatId;

      if (
        !isNaN(this.currentUserId) &&
        chatId !== null &&
        chatId !== undefined
      ) {
        this.chatService.sendChatMessage(
          [this.currentUserId, chatId],
          this.currentUserId,
          this.userNickname,
          message
        );
        this.addMessage(this.currentUserId, message);
        this.messageForm.reset();
      } else {
        console.warn('recipientUserId або selectedChatId не визначено');
      }
    }
  }

  addMessage(senderId: number, message: string): void {
    const timestamp = new Date().toISOString();
    const newMessage: MessageChatModel = {
      message_id: Date.now(),
      message: message,
      timestamp: timestamp,
      user_id: senderId,
      username: this.userNickname
    };
    this.messages.push(newMessage);
  }

  deleteMessage(messageId: number): void {
    this.chatService.deleteChatMessage(messageId);
    this.messages = this.messages.filter(
      (message: MessageChatModel) => message.message_id !== messageId
    );
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  private updateQueryParams(params: { [key: string]: any }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }
}
