import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConfigService } from '../config/config.service';

import { OrganizationModel } from '../../_models/organization/organization.model';
import { OrganizationAuthorityModel } from '../../_models/organization-authority/organization-authority.model';

import { ContentModel, CampaignModel, IdeaModel, NewsModel, BudgetModel, ProjectModel, UserModel, DataPage } from '../../_models';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(private http: HttpClient, private configService: ConfigService) {
  }

  getById(id: number) {
    return this.http.get<OrganizationModel>(`${this.configService.get('apiUrl')}/organization/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
      .set('ids', ids.toString());
    return this.http.get<OrganizationModel[]>(`${this.configService.get('apiUrl')}/organization`, { params });
  }

  list(offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<DataPage<OrganizationModel>>(`${this.configService.get('apiUrl')}/organization`, { params });
  }

  create(organization: OrganizationModel) {
    return this.http.post<OrganizationModel>(`${this.configService.get('apiUrl')}/organization`, organization);
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
    return this.http.get<DataPage<ProjectModel>>(`${this.configService.get('apiUrl')}/organization/${id}/projects`, { params });
  }

  getIdeas(id: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
    return this.http.get<DataPage<IdeaModel>>(`${this.configService.get('apiUrl')}/organization/${id}/ideas`, { params });
  }

  getMembers(organizationId: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<DataPage<UserModel>>(`${this.configService.get('apiUrl')}/organization/${organizationId}/members`, { params });
  }

  getNews(id: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get<DataPage<NewsModel>>(`${this.configService.get('apiUrl')}/organization/${id}/news`, { params });
  }

  getAllContents(id: number) {
    return this.http.get<ContentModel[]>(`${this.configService.get('apiUrl')}/organization/${id}/contents`);
  }

  getContents(id: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get<DataPage<ContentModel>>(`${this.configService.get('apiUrl')}/organization/${id}/contents`, { params });
  }

  getOrganizationAuthorities(organizationsId: number) {
    return this.http.get<OrganizationAuthorityModel[]>(`${this.configService.get('apiUrl')}/organization/${organizationsId}/authorities`, {});
  }

  addMember(organizationId: number, userId: number) {
    return this.http.post(`${this.configService.get('apiUrl')}/organization/${organizationId}/members/${userId}`, {});
  }

  removeMember(organizationId: number, userId: number) {
    const httpParams = new HttpParams().set('aaa', '111');
    httpParams.set('bbb', '222');
    return this.http.delete(`${this.configService.get('apiUrl')}/organization/${organizationId}/members/${userId}`);
  }

}
