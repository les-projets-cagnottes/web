import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Organization, User } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private http: HttpClient) { }

  getById(id: number) {
    return this.http.get<Organization>(`${environment.apiUrl}/organization/${id}`);
  }

  getByMemberId(memberId: number) {
    return this.http.get<Organization[]>(`${environment.apiUrl}/organization?member_id=${memberId}`);
  }

  getByOwner(owner: User, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${environment.apiUrl}/organization?owner_id=${owner.id}`, { params });
  }

  create(organization: Organization) {
    return this.http.post(`${environment.apiUrl}/organization`, organization);
  }

  update(organization: Organization) {
    return this.http.put(`${environment.apiUrl}/organization/${organization.id}`, organization);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${id}`);
  }

  getBudgets(organizationsId: Number[]) {
    const params = new HttpParams()
      .set('organizations_id', organizationsId.toLocaleString());
    return this.http.get<User[]>(`${environment.apiUrl}/organization/budget`, { params });
  }

  getMembers(organizationId: Number, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${environment.apiUrl}/organization/${organizationId}/members`, { params });
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
}
