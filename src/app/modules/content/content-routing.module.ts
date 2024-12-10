import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostsListComponent } from '../../components/content/posts-list/posts-list.component';
import { ChatComponent } from '../../components/content/chat/chat.component';
import { authGuard } from '../../guards/auth.guard';
import { WowComponent } from '../../components/content/wow/wow.component';
import { AllUsersListComponent } from '../../components/users/all-users-list/all-users-list.component';
import { UserDetailsInfoComponent } from '../../components/users/user-details-info/user-details-info.component';

const routes: Routes = [
  { path: '123', component: WowComponent },
  { path: '', redirectTo: 'blogs', pathMatch: 'full' },
  { path: 'blogs', component: PostsListComponent },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'users', component: AllUsersListComponent },
  { path: 'users/:id', component: UserDetailsInfoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule {}
