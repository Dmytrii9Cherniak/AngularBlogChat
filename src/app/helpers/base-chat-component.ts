import { OnInit, OnDestroy, Directive } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketsService } from '../services/websockets.service';
import { UserService } from '../services/user.service';

@Directive()
export abstract class BaseChatComponent implements OnInit, OnDestroy {
  public userNickname: string = '';
  public messageForm: FormGroup;
  public messages: any[] = [];
  protected currentUserId: string;
  protected targetUserId: string;

  constructor(
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected wsService: WebsocketsService,
    protected router: Router,
    protected userService: UserService
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.userService.userProfileData.subscribe((value) => {
      this.currentUserId = value?.userId;
    });

    this.route.queryParams.subscribe((params) => {
      this.userNickname = params['userNickname'];
      this.targetUserId = params['userId'];

      if (!this.targetUserId) {
        console.error('Неможливо підключитися до чату — відсутній userId');
        this.router.navigate(['/users']);
        return;
      }

      this.wsService.connectChat(
        this.currentUserId,
        this.targetUserId,
        this.onMessageReceived.bind(this)
      );
    });
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const message = this.messageForm.value.message;
      this.wsService.sendMessage(
        this.currentUserId,
        this.targetUserId,
        message
      );
      this.addMessage(this.currentUserId, message, 'sent');
      this.messageForm.reset();
    }
  }

  addMessage(
    senderId: string,
    message: string,
    type: 'sent' | 'received'
  ): void {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    this.messages.push({ sender: senderId, message, time, type });
  }

  onMessageReceived(message: any): void {
    if (message.senderId === this.currentUserId) {
      return;
    }
    this.addMessage(message.senderId, message.message, 'received');
  }

  ngOnDestroy(): void {
    this.wsService.disconnectChat(this.currentUserId, this.targetUserId);
  }
}
