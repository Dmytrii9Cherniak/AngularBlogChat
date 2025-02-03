import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../../services/user.profile.service';
import { FriendsResponseModel } from '../../../models/user/friends.response.model';

@Component({
  selector: 'app-friends-list-data',
  templateUrl: './friends-list-data.component.html',
  styleUrls: ['./friends-list-data.component.scss']
})
export class FriendsListDataComponent implements OnInit {
  friendsData: FriendsResponseModel = new FriendsResponseModel();
  isLoading: boolean = true;
  activeTab: string = 'friends';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.userProfileService.getAllFriendsList().subscribe({
      next: (value: FriendsResponseModel) => {
        this.friendsData = new FriendsResponseModel(value);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
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

  acceptOrDeclineFriendRequest(code: string, choice: string) {
    this.userProfileService
      .acceptOrDeclineFriendRequest(code, choice)
      .subscribe({
        next: (value) => {
          console.log(value);
        }
      });
  }
}
