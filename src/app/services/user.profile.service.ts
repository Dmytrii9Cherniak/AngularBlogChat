import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserDataModel } from '../models/user/user.data.model';
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
      .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`)
      .pipe(
        tap((userData: UserDataModel) => {
          this.updateUserProfile(userData);
        })
      );
  }

  public updateUserProfilePersonalData(data: FormData): Observable<any> {
    return this.httpClient.patch(
      `${environment.apiUrl}/profile/update-general`,
      data
    );
  }
}
