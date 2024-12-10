import { Component } from '@angular/core';

import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketsService } from '../../../services/websockets.service';
import { UserService } from '../../../services/user.service';
import { BaseChatComponent } from '../../../helpers/base-chat-component';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent extends BaseChatComponent {
  constructor(
    route: ActivatedRoute,
    fb: FormBuilder,
    wsService: WebsocketsService,
    router: Router,
    userService: UserService
  ) {
    super(route, fb, wsService, router, userService);
  }
}
