import { Injectable } from '@angular/core';
import { Project, Organization, Donation } from '../_models';
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

  getByIdOrganizations(id: number) {
    return this.http.get<Organization[]>(`${environment.apiUrl}/project/${id}/organizations`);
  }

  getByMemberId(memberId: number) {
    return this.http.get<Project[]>(`${environment.apiUrl}/project?memberId=${memberId}`);
  }

  getByBudgetId(budgetId: any, offset, limit) {
    const params = new HttpParams()
        .set('budgetId', budgetId)
        .set('offset', offset)
        .set('limit', limit);
    return this.http.get<Project[]>(`${environment.apiUrl}/project`, { params });
  }

  create(project: Project) {
    return this.http.post<Project>(`${environment.apiUrl}/project`, project);
  }

  update(project: Project) {
    return this.http.put<Project>(`${environment.apiUrl}/project`, project);
  }

  validate() {
    return this.http.post(`${environment.apiUrl}/project/validate`, {});
  }

  createOrganizations(id: number, organizations: Organization[]) {
    return this.http.post(`${environment.apiUrl}/project/${id}/organizations`, organizations);
  }

  join(id: number) {
    return this.http.get(`${environment.apiUrl}/project/${id}/join`);
  }
  
  getDonations(projectId: Number, offset, limit) {
    const params = new HttpParams()
        .set('offset', offset)
        .set('limit', limit);
    return this.http.get<Donation[]>(`${environment.apiUrl}/project/${projectId}/donations`, { params });
  }

}
