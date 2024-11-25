import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  constructor(private httpClient: HttpClient) {}

  public getAllPosts() {
    return this.httpClient.get(`${environment.apiUrl}/api/posts`);
  }
}
