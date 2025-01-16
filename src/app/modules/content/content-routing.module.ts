import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostsListComponent } from '../../components/content/posts-list/posts-list.component';
import { ChatComponent } from '../../components/content/chat/chat.component';
import { AllUsersListComponent } from '../../components/users/all-users-list/all-users-list.component';
import { UserDetailsInfoComponent } from '../../components/users/user-details-info/user-details-info.component';
import { UserProfileDataComponent } from '../../components/profile/user-profile-data/user-profile-data.component';
import { authGuard } from '../../guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'blogs', pathMatch: 'full' },
  { path: 'blogs', component: PostsListComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'users', component: AllUsersListComponent },
  { path: 'users/:id', component: UserDetailsInfoComponent },
  { path: 'profile', component: UserProfileDataComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule {}
