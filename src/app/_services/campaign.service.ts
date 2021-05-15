import { Injectable } from '@angular/core';
import { CampaignModel, DonationModel, OrganizationModel, BudgetModel } from '../_models';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConfigService } from '../_services/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  
  constructor(private http: HttpClient, private configService: ConfigService) { }

  getById(id: number) {
    return this.http.get<CampaignModel>(`${this.configService.get('apiUrl')}/campaign/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
        .set('ids', ids.toString());
    return this.http.get<CampaignModel[]>(`${this.configService.get('apiUrl')}/campaign`, { params });
}

  getBudgets(id: number) {
    return this.http.get<BudgetModel[]>(`${this.configService.get('apiUrl')}/campaign/${id}/budgets`);
  }

  getDonations(CampaignId: number, offset: number, limit: number) {
    const params = new HttpParams()
        .set('offset', offset.toString())
        .set('limit', limit.toString());
    return this.http.get<DonationModel[]>(`${this.configService.get('apiUrl')}/campaign/${CampaignId}/donations`, {params});
  }

  getOrganizations(id: number) {
    return this.http.get<OrganizationModel[]>(`${this.configService.get('apiUrl')}/campaign/${id}/organizations`);
  }

  create(Campaign: CampaignModel) {
    return this.http.post<CampaignModel>(`${this.configService.get('apiUrl')}/campaign`, Campaign);
  }

  update(Campaign: CampaignModel) {
    return this.http.put<CampaignModel>(`${this.configService.get('apiUrl')}/campaign`, Campaign);
  }

  validate() {
    return this.http.post(`${this.configService.get('apiUrl')}/campaign/validate`, {});
  }

  join(id: number) {
    return this.http.post(`${this.configService.get('apiUrl')}/campaign/${id}/join`, {});
  }

}
