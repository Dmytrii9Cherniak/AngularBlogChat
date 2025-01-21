import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project/different.project.list.model';
import { CreateProjectModel } from '../models/project/create.project.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  constructor(private httpClient: HttpClient) {}

  getAllProjects(): Observable<Project[]> {
    return this.httpClient.get<Project[]>(
      `${environment.apiUrl}/profile/projects`
    );
  }

  createNewProject(body: CreateProjectModel): Observable<any> {
    return this.httpClient.post(
      `${environment.apiUrl}/profile/create-project`,
      body
    );
  }

  updateExistingProject(
    projectId: number,
    body: {
      name: string;
      description: string;
      technologies: { name: string; description: string }[];
    }
  ): Observable<any> {
    return this.httpClient.patch(
      `${environment.apiUrl}/profile/update-project/${projectId}`,
      body
    );
  }

  deleteExistingProject(id: number): Observable<any> {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/delete-project/${id}`
    );
  }
}
