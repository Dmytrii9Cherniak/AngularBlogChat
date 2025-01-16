import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { PostsListComponent } from '../../components/content/posts-list/posts-list.component';
import { ChatComponent } from '../../components/content/chat/chat.component';
import { AllUsersListComponent } from '../../components/users/all-users-list/all-users-list.component';
import { UserDetailsInfoComponent } from '../../components/users/user-details-info/user-details-info.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileDataComponent } from '../../components/profile/user-profile-data/user-profile-data.component';

@NgModule({
  declarations: [
    PostsListComponent,
    ChatComponent,
    AllUsersListComponent,
    UserDetailsInfoComponent,
    UserProfileDataComponent
  ],
  imports: [CommonModule, ContentRoutingModule, ReactiveFormsModule]
})
export class ContentModule {}
