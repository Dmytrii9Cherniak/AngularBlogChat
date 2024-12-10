import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private httpClient: HttpClient) {}

  public getAllUsers(): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/users/list/`);
  }

  public getDifferentUser(userId: string): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/users/data/${userId}`);
  }
}
