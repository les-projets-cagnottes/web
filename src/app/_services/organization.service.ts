import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { BudgetModel } from '../_models/budget.model';
import { OrganizationModel } from '../_models/organization.model';
import { OrganizationAuthorityModel } from '../_models/organization.authority.model';

import { User } from '../_entities/user';
import { ContentModel, CampaignModel } from '../_models';
import { Organization } from '../_entities';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private http: HttpClient) {
  }

  getCurrentOrganization() {
    var organization = JSON.parse(localStorage.getItem('currentOrganization'));
    if(organization !== undefined) {
      return this.getById(organization.id);
    }
  }

  getById(id: number) {
    return this.http.get<OrganizationModel>(`${environment.apiUrl}/organization/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
        .set('ids', ids.toString());
    return this.http.get<OrganizationModel[]>(`${environment.apiUrl}/organization`, { params });
}

  getByOwner(owner: User, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${environment.apiUrl}/organization?owner_id=${owner.id}`, { params });
  }

  create(organization: OrganizationModel) {
    return this.http.post(`${environment.apiUrl}/organization`, organization);
  }

  update(organization: OrganizationModel) {
    return this.http.put(`${environment.apiUrl}/organization`, organization);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${id}`);
  }

  getBudgets(organizationId: number) {
    return this.http.get<BudgetModel[]>(`${environment.apiUrl}/organization/${organizationId}/budgets`);
  }

  getUsableBudgets(organizationId: number) {
    return this.http.get<BudgetModel[]>(`${environment.apiUrl}/organization/${organizationId}/budgets/usable`);
  }

  getCampaigns(id: number, offset: number, limit: number, filter: string[]) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('filters', filter.toString());
    return this.http.get<CampaignModel[]>(`${environment.apiUrl}/organization/${id}/campaigns`, { params });
  }

  getMembers(organizationId: number, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${environment.apiUrl}/organization/${organizationId}/members`, { params });
  }

  getAllContents(id: number) {
    return this.http.get<ContentModel[]>(`${environment.apiUrl}/organization/${id}/contents`);
  }

  getContents(id: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get<ContentModel[]>(`${environment.apiUrl}/organization/${id}/contents`, { params });
  }

  addContent(id: number, content: ContentModel) {
    return this.http.post(`${environment.apiUrl}/organization/${id}/contents`, content);
  }

  getOrganizationAuthorities(organizationsId: Number) {
    return this.http.get<OrganizationAuthorityModel[]>(`${environment.apiUrl}/organization/${organizationsId}/authorities`, {});
  }

  addMember(organizationId: number, userId: number) {
    return this.http.post(`${environment.apiUrl}/organization/${organizationId}/members/${userId}`, {});
  }

  removeMember(organizationId: number, userId: number) {
    let httpParams = new HttpParams().set('aaa', '111');
    httpParams.set('bbb', '222');

    let options = { body: userId };
    return this.http.delete(`${environment.apiUrl}/organization/${organizationId}/members/${userId}`);
  }
  
  slack(organizationId: number, code: string, redirect_uri) {
    return this.http.post(`${environment.apiUrl}/organization/${organizationId}/slack?code=${code}&redirect_uri=${redirect_uri}`, {});
  }

  slackSync(organizationId: number) {
    return this.http.post(`${environment.apiUrl}/organization/${organizationId}/slack/sync`, {});
  }

  slackDisconnect(organizationId: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${organizationId}/slack`, {});
  }
}
