import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { ChatComponent } from '../../components/content/chat/chat.component';
import { AllUsersListComponent } from '../../components/users/all-users-list/all-users-list.component';
import { UserDetailsInfoComponent } from '../../components/users/user-details-info/user-details-info.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileDataComponent } from '../../components/profile/user-profile-data/user-profile-data.component';
import { ProjectsComponent } from '../../components/content/projects/projects.component';
import { NotificationsComponent } from '../../components/profile/notifications/notifications.component';

@NgModule({
  declarations: [
    ChatComponent,
    AllUsersListComponent,
    UserDetailsInfoComponent,
    UserProfileDataComponent,
    ProjectsComponent,
    NotificationsComponent
  ],
  imports: [CommonModule, ContentRoutingModule, ReactiveFormsModule]
})
export class ContentModule {}
