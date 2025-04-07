import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewAnnouncementModel } from '../models/announcements/new.announcement.model';
import { environment } from '../../environments/environment';

export interface AnnouncementFilterParams {
  title?: string;
  technologies?: string[];
  job_title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementsService {
  constructor(private httpClient: HttpClient) {}

  public getAllAnnouncements(
    params?: AnnouncementFilterParams
  ): Observable<NewAnnouncementModel[]> {
    let httpParams = new HttpParams();

    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const paramValue = Array.isArray(value)
            ? value.join(',')
            : String(value);
          httpParams = httpParams.set(key, paramValue);
        }
      });
    }

    return this.httpClient.get<NewAnnouncementModel[]>(
      `${environment.apiUrl}/teamup/announcements/list`,
      { params: httpParams }
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
