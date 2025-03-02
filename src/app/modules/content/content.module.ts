import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { ChatComponent } from '../../components/content/chat/chat.component';
import { AllUsersListComponent } from '../../components/users/all-users-list/all-users-list.component';
import { UserDetailsInfoComponent } from '../../components/users/user-details-info/user-details-info.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfileDataComponent } from '../../components/profile/user-profile-data/user-profile-data.component';
import { ProjectsComponent } from '../../components/content/projects/projects.component';
import { NotificationsComponent } from '../../components/profile/notifications/notifications.component';
import { FriendsListDataComponent } from '../../components/profile/friends-list-data/friends-list-data.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalWrapperComponent } from '../../components/layout/modal-wrapper/modal-wrapper.component';

@NgModule({
  declarations: [
    ChatComponent,
    AllUsersListComponent,
    UserDetailsInfoComponent,
    UserProfileDataComponent,
    ProjectsComponent,
    NotificationsComponent,
    FriendsListDataComponent,
    ModalWrapperComponent
  ],
  imports: [
    CommonModule,
    ContentRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe
  ],
  exports: [ModalWrapperComponent]
})
export class ContentModule {}
