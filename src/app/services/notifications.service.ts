import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationModel } from '../models/notifications/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private httpClient: HttpClient) {}

  getAllNotifications(): Observable<NotificationModel[]> {
    return this.httpClient.get<NotificationModel[]>(
      `${environment.apiUrl}/profile/inbox`
    );
  }
}
