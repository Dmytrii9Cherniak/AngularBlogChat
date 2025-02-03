import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { UsersListModel } from '../../../models/user/users.list.model';
import { DifferentUserDetailsInfoModel } from '../../../models/user/different.user.details.info.model';
import { UserProfileService } from '../../../services/user.profile.service';

@Component({
  selector: 'app-all-users-list',
  templateUrl: './all-users-list.component.html',
  styleUrls: ['./all-users-list.component.scss']
})
export class AllUsersListComponent implements OnInit {
  public allUsersList: Observable<UsersListModel[]>;
  public isAuthenticated: Observable<boolean>;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated$;
    this.allUsersList = this.usersService.getAllUsers();
  }

  navigateToChat(user: DifferentUserDetailsInfoModel): void {
    this.router.navigate(['/chat'], {
      queryParams: { userId: user.id, username: user.username }
    });
  }

  navigateToUserInfo(user: DifferentUserDetailsInfoModel): void {
    this.router.navigate(['/users', user.id]);
  }

  addUserToMyFriends(userId: number): void {
    this.userProfileService.addNewFriend(userId).subscribe({
      next: (value) => {
        console.log(value);
      }
    });
  }

  removeUserFromMyFriends(userId: number): void {
    this.userProfileService.removeUserFromMyFriends(userId).subscribe({
      next: (value) => {
        console.log(value);
      }
    });
  }

  cancelFriendRequest(offerCode: string) {
    this.userProfileService.cancelFriendRequest(offerCode).subscribe({
      next: (value) => {
        console.log(value);
      }
    });
  }

  blockUser(userId: number) {
    this.usersService.blockOrUnblockCertainUser(userId).subscribe({
      next: (value) => {
        console.log(value);
      }
    });
  }
}
