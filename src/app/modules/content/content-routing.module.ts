import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '../../components/content/chat/chat.component';
import { AllUsersListComponent } from '../../components/users/all-users-list/all-users-list.component';
import { UserDetailsInfoComponent } from '../../components/users/user-details-info/user-details-info.component';
import { UserProfileDataComponent } from '../../components/profile/user-profile-data/user-profile-data.component';
import { ProjectsComponent } from '../../components/content/projects/projects.component';
import { authGuard } from '../../guards/auth.guard';
import { NotificationsComponent } from '../../components/profile/notifications/notifications.component';
import { FriendsListDataComponent } from '../../components/profile/friends-list-data/friends-list-data.component';
import { AnnouncementsComponent } from '../../components/content/announcements/announcements.component';
import { DifferentAnnouncementComponent } from '../../components/content/different-announcement/different-announcement.component';

const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'users', component: AllUsersListComponent },
  { path: 'users/:id', component: UserDetailsInfoComponent },
  {
    path: 'profile',
    component: UserProfileDataComponent,
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'friends',
    component: FriendsListDataComponent,
    canActivate: [authGuard]
  },
  { path: 'projects', component: ProjectsComponent },
  {
    path: 'announcements',
    component: AnnouncementsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'announcements/details',
    component: DifferentAnnouncementComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule {}
