import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserDataModel } from '../models/user/user.data.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userProfileData: BehaviorSubject<UserDataModel | null> =
    new BehaviorSubject<UserDataModel | null>(null);

  constructor(private httpClient: HttpClient) {}

  // Оновлення профілю
  public updateUserProfile(userData: UserDataModel): void {
    this.userProfileData.next(userData);
  }

  // Завантаження даних користувача
  public getUserData(): Observable<UserDataModel> {
    return this.httpClient
      .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`)
      .pipe(
        tap((userData: UserDataModel) => {
          this.updateUserProfile(userData);
        })
      );
  }
}
