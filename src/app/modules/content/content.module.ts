import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { PostsListComponent } from '../../components/content/posts-list/posts-list.component';
import { ChatComponent } from '../../components/content/chat/chat.component';
import { WowComponent } from '../../components/content/wow/wow.component';
import { AllUsersListComponent } from '../../components/users/all-users-list/all-users-list.component';
import { UserDetailsInfoComponent } from '../../components/users/user-details-info/user-details-info.component';

@NgModule({
  declarations: [
    PostsListComponent,
    ChatComponent,
    WowComponent,
    AllUsersListComponent,
    UserDetailsInfoComponent
  ],
  imports: [CommonModule, ContentRoutingModule]
})
export class ContentModule {}
