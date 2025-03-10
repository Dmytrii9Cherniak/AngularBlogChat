import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersListModel } from '../models/user/users.list.model';
import { BlacklistUsersListModel } from '../models/blacklist/blacklist.users.list';
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

  getMyBlackUsersList(): Observable<BlacklistUsersListModel[]> {
    return this.httpClient.get<BlacklistUsersListModel[]>(
      `${environment.apiUrl}/users/blacklist/list`
    );
  }

  blockOrUnblockCertainUser(blockedUserId: number) {
    const body = {
      expires_at: new Date(new Date().setDate(new Date().getDate() + 31))
    };

    return this.httpClient.post(
      `${environment.apiUrl}/users/blacklist/add/${blockedUserId}`,
      body
    );
  }
}
