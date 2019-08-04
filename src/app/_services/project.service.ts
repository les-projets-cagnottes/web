import { Injectable } from '@angular/core';
import { Project } from '../_models';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) { }

  create(project: Project) {
      return this.http.post(`${environment.apiUrl}/project`, project);
  }

}
