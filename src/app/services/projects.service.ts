import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Project } from '../models/project/different.project.list.model';
import { CreateProjectModel } from '../models/project/create.project.model';
import { environment } from '../../environments/environment';
import { CreateProjectInvite } from '../models/project/create.project.invite';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  public allProjectList: BehaviorSubject<Project[]> = new BehaviorSubject<
    Project[]
  >([]);

  constructor(private httpClient: HttpClient) {}

  getAllProjects(): Observable<Project[]> {
    return this.httpClient
      .get<Project[]>(`${environment.apiUrl}/profile/projects`)
      .pipe(
        tap((value) => {
          this.allProjectList.next(value);
        })
      );
  }

  createNewProject(body: CreateProjectModel) {
    return this.httpClient.post(
      `${environment.apiUrl}/profile/projects/create`,
      body
    );
  }

  updateExistingProject(projectId: number, body: CreateProjectModel) {
    return this.httpClient.patch(
      `${environment.apiUrl}/profile/projects/update/${projectId}`,
      body
    );
  }

  deleteExistingProject(id: number) {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/projects/delete/${id}`
    );
  }

  createProjectInvite(project_id: number, body: CreateProjectInvite) {
    return this.httpClient.post(
      `${environment.apiUrl}/profile/projects/members/offers/create/${project_id}`,
      body
    );
  }

  responseProjectInvite(offer_code: string, choice: string) {
    const userInviteChoice = {
      status: choice
    };

    return this.httpClient.post(
      `${environment.apiUrl}/profile/projects/members/offers/response/${offer_code}`,
      userInviteChoice
    );
  }

  deleteProjectMembers(
    projectId: number,
    members: number[]
  ): Observable<Object> {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/projects/${projectId}/members/kick`,
      {
        body: { members } // Відправляємо масив ID користувачів
      }
    );
  }

  leaveCertainProject(id: number, body: Object): Observable<Object> {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/projects/${id}/members/leave`,
      { body }
    );
  }
}
