import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewAnnouncementModel } from '../models/announcements/new.announcement.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementsService {
  constructor(private httpClient: HttpClient) {}

  public getAllAnnouncements(
    title?: string
  ): Observable<NewAnnouncementModel[]> {
    const params = title ? { params: { title } } : {};
    return this.httpClient.get<NewAnnouncementModel[]>(
      `${environment.apiUrl}/teamup/announcements/list`,
      params
    );
  }

  public getDifferentAnnouncement(
    id: string
  ): Observable<NewAnnouncementModel> {
    return this.httpClient.get(
      `${environment.apiUrl}/teamup/announcements/get/${id}`
    );
  }

  public createNewAnnouncement(
    body: NewAnnouncementModel
  ): Observable<NewAnnouncementModel> {
    return this.httpClient.post(
      `${environment.apiUrl}/teamup/announcements/create`,
      body
    );
  }

  public deleteProjectAnnouncement(id: number) {
    return this.httpClient.delete(
      `${environment.apiUrl}/teamup/announcements/delete/${id}`
    );
  }

  public updateProjectAnnouncement(
    id: number,
    body: NewAnnouncementModel
  ): Observable<NewAnnouncementModel> {
    return this.httpClient.patch(
      `${environment.apiUrl}/teamup/announcements/update/${id}`,
      body
    );
  }
}
