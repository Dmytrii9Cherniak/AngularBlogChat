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
  public username: string = '';
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
    // Отримуємо ID поточного користувача
    this.userService.userProfileData.subscribe((value) => {
      this.currentUserId = Number(value?.userId);
    });

    // Завантажуємо список чатів
    this.chats = this.chatService.requestChatList();

    // Отримуємо параметри з URL
    this.route.queryParams.subscribe((params) => {
      const chatIdFromUrl = params['chatId'] ? Number(params['chatId']) : null;
      const userIdFromUrl = params['userId'] ? Number(params['userId']) : null;
      const usernameFromUrl = params['username'] || '';

      if (chatIdFromUrl) {
        this.selectedChatId = chatIdFromUrl;
        this.username = usernameFromUrl;
        this.connectToChat(chatIdFromUrl);
      } else if (userIdFromUrl) {
        this.recipientUserId = userIdFromUrl;
        this.username = usernameFromUrl;
        this.findChatWithUser(usernameFromUrl);
      }
    });
  }

  selectChat(chatId: number, chat: any = null): void {
    if (this.selectedChatId !== chatId) {
      this.selectedChatId = chatId;
      this.recipientUserId = null; // Якщо це існуючий чат, то індивідуальний користувач не потрібен
      this.clearMessages();

      if (chat) {
        console.log(chat);
      }

      this.chatService.requestChatList().subscribe((chats) => {
        const selectedChat = chats.find((chat) => chat.chat_id === chatId);
        if (selectedChat) {
          const usersInChat = selectedChat.chat_users.split(', ');
          const recipientUsername = usersInChat.find(
            (user) => user !== this.currentUserId.toString()
          );
          this.username = recipientUsername || 'Unknown User';

          this.updateQueryParams({
            chatId,
            username: this.username
          });
        }
      });

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
          } else {
            this.clearChat();
          }
        },
        error: () => {
          this.clearChat();
        }
      });
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const message = this.messageForm.value.message;
      const chatId = this.recipientUserId ?? this.selectedChatId;

      if (!isNaN(this.currentUserId) && chatId !== null && chatId !== undefined) {
        this.chatService.sendChatMessage(
          [this.currentUserId, chatId],
          this.currentUserId,
          this.username,
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
      username: this.username
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

  private clearMessages(): void {
    this.messages = [];
    this.username = '';
    this.selectedChatId = null;
    this.recipientUserId = null;
  }

  private findChatWithUser(username: string): void {
    this.chatService.requestChatList().subscribe((chats) => {
      const chatWithUser = chats.find((chat) =>
        chat.chat_users.includes(username)
      );
      if (chatWithUser) {
        this.selectChat(chatWithUser.chat_id);
      } else {
        console.warn('Чат з користувачем не знайдено');
        this.clearMessages();
      }
    });
  }

  private clearChat(): void {
    this.messages = [];
    this.username = '';
    this.selectedChatId = null;
    this.recipientUserId = null;

    this.updateQueryParams({
      chatId: null,
      username: null
    });
  }
}



// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { WebsocketsService } from '../../../services/websockets.service';
// import { UserService } from '../../../services/user.service';
// import { ChatService } from '../../../services/chat.service';
// import { Observable } from 'rxjs';
// import { DifferentChatModel } from '../../../models/chat/different.chat.model';
// import { MessageChatModel } from '../../../models/chat/message.chat.model';
//
// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.scss']
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   public username: string = '';
//   public messageForm: FormGroup;
//   public messages: MessageChatModel[] = [];
//   public chats: Observable<DifferentChatModel[]>;
//   public currentUserId: number = 0;
//   public selectedChatId: number | null = null;
//   public recipientUserId: number | null = null;
//
//   constructor(
//     protected route: ActivatedRoute,
//     protected fb: FormBuilder,
//     protected wsService: WebsocketsService,
//     protected router: Router,
//     protected userService: UserService,
//     protected chatService: ChatService
//   ) {
//     this.messageForm = this.fb.group({
//       message: ['', [Validators.required, Validators.minLength(1)]]
//     });
//   }
//
//   ngOnInit(): void {
//     this.userService.userProfileData.subscribe((value) => {
//       this.currentUserId = Number(value?.userId);
//     });
//
//     this.chats = this.chatService.requestChatList();
//
//     this.route.queryParams.subscribe((params) => {
//       const chatIdFromUrl = params['chatId'] ? Number(params['chatId']) : null;
//       const userIdFromUrl = params['userId'] ? Number(params['userId']) : null;
//       const usernameFromUrl = params['username'] || '';
//
//       if (chatIdFromUrl) {
//         this.selectedChatId = chatIdFromUrl;
//         this.username = usernameFromUrl;
//         this.loadChatMessages(chatIdFromUrl);
//       } else if (userIdFromUrl) {
//         this.recipientUserId = userIdFromUrl;
//         this.username = usernameFromUrl;
//         this.findChatWithUser(usernameFromUrl); // Виправлено
//       }
//     });
//   }
//
//   private findChatWithUser(username: string): void {
//     this.chatService.requestChatList().subscribe((chats) => {
//       const chatWithUser = chats.find((chat) =>
//         chat.chat_users.includes(username)
//       );
//       if (chatWithUser) {
//         this.selectChat(chatWithUser.chat_id);
//       } else {
//         console.warn('Чат з користувачем не знайдено');
//         this.clearMessages();
//       }
//     });
//   }
//
//   selectChat(chatId: number): void {
//     if (this.selectedChatId !== chatId) {
//       this.selectedChatId = chatId;
//       this.recipientUserId = null;
//       this.clearMessages();
//
//       this.chatService.requestChatList().subscribe((chats) => {
//         const selectedChat = chats.find((chat) => chat.chat_id === chatId);
//         if (selectedChat) {
//           const usersInChat = selectedChat.chat_users.split(', ');
//           const recipientUsername = usersInChat.find(
//             (user) => user !== this.currentUserId.toString()
//           );
//           this.username = recipientUsername || 'Unknown User';
//
//           this.updateQueryParams({
//             chatId,
//             username: this.username
//           });
//         }
//       });
//
//       this.loadChatMessages(chatId);
//     }
//   }
//
//   private loadChatMessages(chatId: number): void {
//     this.chatService.requestChatMessages(chatId).subscribe({
//       next: (response: { messages: MessageChatModel[] }) => {
//         if (response && Array.isArray(response.messages)) {
//           this.messages = response.messages;
//         } else {
//           this.clearMessages();
//         }
//       },
//       error: () => {
//         this.clearMessages();
//       }
//     });
//   }
//
//   sendMessage(): void {
//     if (this.messageForm.valid) {
//       const message = this.messageForm.value.message;
//       const chatId = this.recipientUserId ?? this.selectedChatId;
//
//       if (
//         !isNaN(this.currentUserId) &&
//         chatId !== null &&
//         chatId !== undefined
//       ) {
//         this.chatService.sendChatMessage(
//           [this.currentUserId, chatId],
//           this.currentUserId,
//           this.username,
//           message
//         );
//         this.messageForm.reset();
//       } else {
//         console.warn('recipientUserId або selectedChatId не визначено');
//       }
//     }
//   }
//
//   private updateQueryParams(params: { [key: string]: any }): void {
//     this.router.navigate([], {
//       relativeTo: this.route,
//       queryParams: params,
//       queryParamsHandling: 'merge'
//     });
//   }
//
//   private clearMessages(): void {
//     this.messages = [];
//     this.username = '';
//     this.selectedChatId = null;
//     this.recipientUserId = null;
//   }
//
//   ngOnDestroy() {}
// }

// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { WebsocketsService } from '../../../services/websockets.service';
// import { UserService } from '../../../services/user.service';
// import { ChatService } from '../../../services/chat.service';
// import { Observable, Subscription } from 'rxjs';
// import { DifferentChatModel } from '../../../models/chat/different.chat.model';
// import { MessageChatModel } from '../../../models/chat/message.chat.model';
//
// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.scss']
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   public username: string = '';
//   public messageForm: FormGroup;
//   public messages: MessageChatModel[] = [];
//   public chats: Observable<DifferentChatModel[]>;
//   public currentUserId: number = 0;
//   public selectedChatId: number | null = null;
//   public recipientUserId: number | null = null;
//   private messageSubscription: Subscription | null = null;
//
//   constructor(
//     protected route: ActivatedRoute,
//     protected fb: FormBuilder,
//     protected wsService: WebsocketsService,
//     protected router: Router,
//     protected userService: UserService,
//     protected chatService: ChatService
//   ) {
//     this.messageForm = this.fb.group({
//       message: ['', [Validators.required, Validators.minLength(1)]]
//     });
//   }
//
//   ngOnInit(): void {
//     // Отримуємо id поточного користувача
//     this.userService.userProfileData.subscribe((value) => {
//       this.currentUserId = Number(value?.userId);
//     });
//
//     // Отримуємо queryParams (chatId і userNickname) після перезавантаження
//     this.route.queryParams.subscribe((params) => {
//       const chatIdFromUrl = params['chatId'] ? Number(params['chatId']) : null;
//       const userNicknameFromUrl = params['username'] || '';
//
//       if (chatIdFromUrl) {
//         this.selectedChatId = chatIdFromUrl;
//         this.username = userNicknameFromUrl;
//         this.connectToChat(chatIdFromUrl);
//       } else if (params['userId']) {
//         this.recipientUserId = Number(params['userId']);
//         this.username = params['username'] || '';
//       }
//     });
//
//     this.chats = this.chatService.requestChatList();
//   }
//
//   selectChat(chatId: number): void {
//     if (this.selectedChatId !== chatId) {
//       this.selectedChatId = chatId;
//       this.messages = [];
//
//       if (this.messageSubscription) {
//         this.messageSubscription.unsubscribe();
//       }
//
//       this.chatService.requestChatList().subscribe((chats) => {
//         const selectedChat = chats.find((chat) => chat.chat_id === chatId);
//         if (selectedChat) {
//           const usersInChat = selectedChat.chat_users.split(', ');
//           const recipientUsername = usersInChat.find(
//             (user) => user !== this.currentUserId.toString()
//           );
//           this.username = recipientUsername || 'Unknown User';
//
//           // Оновлюємо URL з userId та userNickname
//           this.updateQueryParams({
//             chatId,
//             username: this.username
//           });
//         }
//       });
//
//       this.connectToChat(chatId);
//     }
//   }
//
//   private connectToChat(chatId: number): void {
//     if (this.messageSubscription) {
//       this.messageSubscription.unsubscribe();
//     }
//
//     this.messages = [];
//
//     this.messageSubscription = this.chatService
//       .requestChatMessages(chatId)
//       .subscribe({
//         next: (response: { messages: MessageChatModel[] }) => {
//           if (response && Array.isArray(response.messages)) {
//             this.messages = response.messages;
//           } else {
//             this.clearChat();
//           }
//         },
//         error: () => {
//           this.clearChat();
//         }
//       });
//   }
//
//   sendMessage(): void {
//     if (this.messageForm.valid) {
//       const message = this.messageForm.value.message;
//       const chatId = this.recipientUserId ?? this.selectedChatId;
//
//       if (
//         !isNaN(this.currentUserId) &&
//         chatId !== null &&
//         chatId !== undefined
//       ) {
//         this.chatService.sendChatMessage(
//           [this.currentUserId, chatId],
//           this.currentUserId,
//           this.username,
//           message
//         );
//         this.addMessage(this.currentUserId, message);
//         this.messageForm.reset();
//       } else {
//         console.warn('recipientUserId або selectedChatId не визначено');
//       }
//     }
//   }
//
//   addMessage(senderId: number, message: string): void {
//     const timestamp = new Date().toISOString();
//     const newMessage: MessageChatModel = {
//       message_id: Date.now(),
//       message: message,
//       timestamp: timestamp,
//       user_id: senderId,
//       username: this.username
//     };
//     this.messages.push(newMessage);
//   }
//
//   deleteMessage(messageId: number): void {
//     this.chatService.deleteChatMessage(messageId);
//     this.messages = this.messages.filter(
//       (message: MessageChatModel) => message.message_id !== messageId
//     );
//   }
//
//   ngOnDestroy(): void {
//     this.wsService.disconnect();
//     if (this.messageSubscription) {
//       this.messageSubscription.unsubscribe();
//     }
//   }
//
//   private updateQueryParams(params: { [key: string]: any }): void {
//     this.router.navigate([], {
//       relativeTo: this.route,
//       queryParams: params,
//       queryParamsHandling: 'merge'
//     });
//   }
//
//   private clearChat(): void {
//     this.messages = [];
//     this.username = '';
//     this.selectedChatId = null;
//     this.recipientUserId = null;
//
//     this.updateQueryParams({
//       chatId: null,
//       userNickname: null
//     });
//   }
// }
