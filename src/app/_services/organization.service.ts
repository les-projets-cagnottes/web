import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConfigService } from '../_services/config/config.service';

import { BudgetModel } from '../_models/budget.model';
import { OrganizationModel } from '../_models/organization/organization.model';
import { OrganizationAuthorityModel } from '../_models/organization.authority.model';

import { User } from '../_entities/user';
import { ContentModel, CampaignModel, IdeaModel, NewsModel } from '../_models';
import { ProjectModel } from '../_models/project/project.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private http: HttpClient, private configService: ConfigService) {
  }

  getCurrentOrganization() {
    var organization = JSON.parse(localStorage.getItem('currentOrganization'));
    if(organization !== undefined) {
      return this.getById(organization.id);
    }
  }

  getById(id: number) {
    return this.http.get<OrganizationModel>(`${this.configService.get('apiUrl')}/organization/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
        .set('ids', ids.toString());
    return this.http.get<OrganizationModel[]>(`${this.configService.get('apiUrl')}/organization`, { params });
}

  getByOwner(owner: User, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${this.configService.get('apiUrl')}/organization?owner_id=${owner.id}`, { params });
  }

  create(organization: OrganizationModel) {
    return this.http.post(`${this.configService.get('apiUrl')}/organization`, organization);
  }

  update(organization: OrganizationModel) {
    return this.http.put(`${this.configService.get('apiUrl')}/organization`, organization);
  }

  delete(id: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/organization/${id}`);
  }

  getBudgets(organizationId: number) {
    return this.http.get<BudgetModel[]>(`${this.configService.get('apiUrl')}/organization/${organizationId}/budgets`);
  }

  getUsableBudgets(organizationId: number) {
    return this.http.get<BudgetModel[]>(`${this.configService.get('apiUrl')}/organization/${organizationId}/budgets/usable`);
  }

  getCampaigns(id: number, offset: number, limit: number, filter: string[]) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('filters', filter.toString());
    return this.http.get<CampaignModel[]>(`${this.configService.get('apiUrl')}/organization/${id}/campaigns`, { params });
  }

  getProjects(id: number, offset: number, limit: number, filter: string[]) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('filters', filter.toString());
    return this.http.get<ProjectModel[]>(`${this.configService.get('apiUrl')}/organization/${id}/projects`, { params });
  }

  getIdeas(id: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
    return this.http.get<IdeaModel[]>(`${this.configService.get('apiUrl')}/organization/${id}/ideas`, { params });
  }

  getMembers(organizationId: number, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<User[]>(`${this.configService.get('apiUrl')}/organization/${organizationId}/members`, { params });
  }

  getNews(id: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get<NewsModel[]>(`${this.configService.get('apiUrl')}/organization/${id}/news`, { params });
  }

  getAllContents(id: number) {
    return this.http.get<ContentModel[]>(`${this.configService.get('apiUrl')}/organization/${id}/contents`);
  }

  getContents(id: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get<ContentModel[]>(`${this.configService.get('apiUrl')}/organization/${id}/contents`, { params });
  }

  getOrganizationAuthorities(organizationsId: Number) {
    return this.http.get<OrganizationAuthorityModel[]>(`${this.configService.get('apiUrl')}/organization/${organizationsId}/authorities`, {});
  }

  addMember(organizationId: number, userId: number) {
    return this.http.post(`${this.configService.get('apiUrl')}/organization/${organizationId}/members/${userId}`, {});
  }

  removeMember(organizationId: number, userId: number) {
    let httpParams = new HttpParams().set('aaa', '111');
    httpParams.set('bbb', '222');

    let options = { body: userId };
    return this.http.delete(`${this.configService.get('apiUrl')}/organization/${organizationId}/members/${userId}`);
  }
  
  slack(organizationId: number, code: string, redirect_uri) {
    return this.http.post(`${this.configService.get('apiUrl')}/organization/${organizationId}/slack?code=${code}&redirect_uri=${redirect_uri}`, {});
  }

  slackSync(organizationId: number) {
    return this.http.post(`${this.configService.get('apiUrl')}/organization/${organizationId}/slack/sync`, {});
  }

  slackDisconnect(organizationId: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/organization/${organizationId}/slack`, {});
  }
}
