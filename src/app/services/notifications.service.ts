import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationModel } from '../models/notifications/notification.model';
import { environment } from '../../environments/environment';

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

  deleteCertainNotification(id: number) {
    return this.httpClient.delete<NotificationModel[]>(
      `${environment.apiUrl}/profile/inbox/delete/${id}`
    );
  }
}
