import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProjectModel } from 'src/app/_models/project/project.model';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient, private configService: ConfigService) { }

  getById(id: number) {
    return this.http.get<ProjectModel>(`${this.configService.get('apiUrl')}/project/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
      .set('ids', ids.toString());
    return this.http.get<ProjectModel[]>(`${this.configService.get('apiUrl')}/project`, { params });
  }

  getOrganizations(id: number) {
    return this.http.get<ProjectModel[]>(`${this.configService.get('apiUrl')}/project/${id}/organizations`);
  }

  create(project: ProjectModel) {
    return this.http.post<ProjectModel>(`${this.configService.get('apiUrl')}/project`, project);
  }

  update(project: ProjectModel) {
    return this.http.put<ProjectModel>(`${this.configService.get('apiUrl')}/project`, project);
  }

  validate() {
    return this.http.post(`${this.configService.get('apiUrl')}/project/validate`, {});
  }

  join(id: number) {
    return this.http.post(`${this.configService.get('apiUrl')}/project/${id}/join`, {});
  }

  publish(id: number) {
    return this.http.post(`${this.configService.get('apiUrl')}/project/${id}/publish`, {});
  }

}
