import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { User, OrganizationModel, BudgetModel } from '../_models';
import { OrganizationAuthority } from '../_models/organizationAuthority';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private http: HttpClient) { }

  getById(id: number) {
    return this.http.get<OrganizationModel>(`${environment.apiUrl}/organization/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
        .set('ids', ids.toString());
    return this.http.get<OrganizationModel[]>(`${environment.apiUrl}/organization`, { params });
}

  getByMemberId(memberId: number) {
    return this.http.get<OrganizationModel[]>(`${environment.apiUrl}/user/${memberId}/organizations`);
  }

  getByOwner(owner: User, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${environment.apiUrl}/organization?owner_id=${owner.id}`, { params });
  }

  getBudgets(organizationId: number) {
    return this.http.get<BudgetModel[]>(`${environment.apiUrl}/organization/${organizationId}/budgets`);
  }

  create(organization: OrganizationModel) {
    return this.http.post(`${environment.apiUrl}/organization`, organization);
  }

  update(organization: OrganizationModel) {
    return this.http.put(`${environment.apiUrl}/organization/${organization.id}`, organization);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${id}`);
  }

  getMembers(organizationId: Number, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${environment.apiUrl}/organization/${organizationId}/members`, { params });
  }

  getOrganizationAuthorities(organizationsId: Number) {
    return this.http.get<OrganizationAuthority[]>(`${environment.apiUrl}/organization/${organizationsId}/authorities`, {});
  }

  addMember(organizationId: number, userId: number) {
    return this.http.post(`${environment.apiUrl}/organization/${organizationId}/members`, userId);
  }

  removeMember(organizationId: number, userId: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${organizationId}/members?userId=${userId}`);
  }
  
  slack(organizationId: number, code: string, redirect_uri) {
    return this.http.post(`${environment.apiUrl}/organization/${organizationId}/slack?code=${code}&redirect_uri=${redirect_uri}`, {});
  }

  slackSync(organizationId: number) {
    return this.http.post(`${environment.apiUrl}/organization/${organizationId}/slack/sync`, {});
  }

  slackDisconnect(organizationId: number, slackTeamId: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${organizationId}/slack/${slackTeamId}`, {});
  }
}
