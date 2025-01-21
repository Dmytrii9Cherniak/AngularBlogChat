import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../models/project/create.project.model';

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

  createNewProject(body: Project): Observable<any> {
    return this.httpClient.post(
      `${environment.apiUrl}/profile/create-project`,
      body
    );
  }
}
