import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserDataModel } from '../models/user/user.data.model';
import { FriendsResponseModel } from '../models/user/friends.response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  public userProfileData: BehaviorSubject<UserDataModel | null> =
    new BehaviorSubject<UserDataModel | null>(null);

  constructor(private httpClient: HttpClient) {}

  public updateUserProfile(userData: UserDataModel): void {
    this.userProfileData.next(userData);
  }

  public getUserData(): Observable<UserDataModel> {
    return this.httpClient
      .get<UserDataModel>(`${environment.apiUrl}/auth/user-data`)
      .pipe(
        tap((userData: UserDataModel) => {
          this.updateUserProfile(userData);
        })
      );
  }

  public updatePersonalUserProfileData(data: FormData) {
    return this.httpClient.patch(
      `${environment.apiUrl}/profile/update-general`,
      data
    );
  }

  getAllFriendsList(): Observable<FriendsResponseModel> {
    return this.httpClient.get<FriendsResponseModel>(
      `${environment.apiUrl}/profile/friends/list`
    );
  }

  addNewFriend(friend_id: number) {
    const body = {
      expires_at: new Date(new Date().setDate(new Date().getDate() + 31)),
      description: 'Some description'
    };

    return this.httpClient.post(
      `${environment.apiUrl}/profile/friends/add/${friend_id}`,
      body
    );
  }

  removeUserFromMyFriends(friend_id: number) {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/friends/remove/${friend_id}`
    );
  }

  cancelFriendRequest(offer_code: string) {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/friends/delete-offer/${offer_code}`
    );
  }

  acceptOrDeclineFriendRequest(offer_code: string, choice: string) {
    const userFriendChoice = {
      status: choice
    };

    return this.httpClient.post(
      `${environment.apiUrl}/profile/friends/response/${offer_code}`,
      userFriendChoice
    );
  }
}
