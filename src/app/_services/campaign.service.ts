import { Injectable } from '@angular/core';
import { Campaign, Organization, Donation } from '../_models';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  
  constructor(private http: HttpClient) { }

  getAll(offset, limit, filter) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit)
      .set('filters', filter);
    return this.http.get<Campaign[]>(`${environment.apiUrl}/campaign`, { params });
  }

  getById(id: number) {
    return this.http.get<Campaign>(`${environment.apiUrl}/campaign/${id}`);
  }

  getByIdOrganizations(id: number) {
    return this.http.get<Organization[]>(`${environment.apiUrl}/campaign/${id}/organizations`);
  }

  getByMemberId(memberId: number) {
    return this.http.get<Campaign[]>(`${environment.apiUrl}/campaign?memberId=${memberId}`);
  }

  getByBudgetId(budgetId: any, offset, limit) {
    const params = new HttpParams()
        .set('budgetId', budgetId)
        .set('offset', offset)
        .set('limit', limit);
    return this.http.get<Campaign[]>(`${environment.apiUrl}/campaign`, { params });
  }

  getDonations(CampaignId: number, offset: number, limit: number) {
    const params = new HttpParams()
        .set('offset', offset.toString())
        .set('limit', limit.toString());
    return this.http.get<Donation[]>(`${environment.apiUrl}/campaign/${CampaignId}/donations`, {params});
  }

  create(Campaign: Campaign) {
    return this.http.post<Campaign>(`${environment.apiUrl}/campaign`, Campaign);
  }

  update(Campaign: Campaign) {
    return this.http.put<Campaign>(`${environment.apiUrl}/campaign`, Campaign);
  }

  validate() {
    return this.http.post(`${environment.apiUrl}/campaign/validate`, {});
  }

  createOrganizations(id: number, organizations: Organization[]) {
    return this.http.post(`${environment.apiUrl}/campaign/${id}/organizations`, organizations);
  }

  join(id: number) {
    return this.http.post(`${environment.apiUrl}/campaign/${id}/join`, {});
  }

}
