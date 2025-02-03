import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersListModel } from '../models/user/users.list.model';
import { DifferentUserDetailsInfoModel } from '../models/user/different.user.details.info.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private httpClient: HttpClient) {}

  public getAllUsers(): Observable<UsersListModel[]> {
    return this.httpClient.get<UsersListModel[]>(
      `${environment.apiUrl}/users/list/`
    );
  }

  public getDifferentUser(
    userId: string
  ): Observable<DifferentUserDetailsInfoModel> {
    return this.httpClient.get<DifferentUserDetailsInfoModel>(
      `${environment.apiUrl}/users/data/${userId}`
    );
  }

  blockOrUnblockCertainUser(blockedUserId: number) {
    const body = {
      expires_at: new Date(new Date().setDate(new Date().getDate() + 31))
    };

    return this.httpClient.post(
      `${environment.apiUrl}/users/block/${blockedUserId}`,
      body
    );
  }
}
