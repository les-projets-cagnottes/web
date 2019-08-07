import { Injectable } from '@angular/core';
import { Project } from '../_models';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) { }

  getAll(offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<Project[]>(`${environment.apiUrl}/project`, { params });
  }

  getById(id: number) {
    return this.http.get<Project>(`${environment.apiUrl}/project/${id}`);
  }

  create(project: Project) {
    return this.http.post(`${environment.apiUrl}/project`, project);
  }

}
