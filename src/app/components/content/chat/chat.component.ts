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
    this.userService.userProfileData.subscribe((value) => {
      this.currentUserId = Number(value?.userId);
    });

    this.route.queryParams.subscribe((params) => {
      this.userNickname = params['userNickname'];
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

      this.connectToChat(chatId);
    }
  }

  private connectToChat(chatId: number): void {
    console.log('Підключаємося до чату з chatId:', chatId);

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.messages = [];

    this.messageSubscription = this.chatService
      .requestChatMessages(chatId)
      .subscribe({
        next: (response: { messages: MessageChatModel[] }) => {
          if (response && Array.isArray(response.messages)) {
            console.log('Отримані повідомлення:', response.messages);
            this.messages = response.messages;
          } else {
            console.warn('Неправильний формат відповіді:', response);
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
      const currentUserId = this.currentUserId;

      console.log(currentUserId);

      if (!isNaN(currentUserId) && this.selectedChatId) {
        console.log('works');
        this.chatService.sendChatMessage(
          [currentUserId, this.selectedChatId],
          currentUserId,
          this.userNickname,
          message
        );
        this.addMessage(currentUserId, message);
        this.messageForm.reset();
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
}
