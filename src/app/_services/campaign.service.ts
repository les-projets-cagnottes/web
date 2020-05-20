import { Injectable } from '@angular/core';
import { CampaignModel, DonationModel, OrganizationModel } from '../_models';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  
  constructor(private http: HttpClient) { }

  getById(id: number) {
    return this.http.get<CampaignModel>(`${environment.apiUrl}/campaign/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
        .set('ids', ids.toString());
    return this.http.get<CampaignModel[]>(`${environment.apiUrl}/campaign`, { params });
}

  getOrganizations(id: number) {
    return this.http.get<OrganizationModel[]>(`${environment.apiUrl}/campaign/${id}/organizations`);
  }

  getDonations(CampaignId: number, offset: number, limit: number) {
    const params = new HttpParams()
        .set('offset', offset.toString())
        .set('limit', limit.toString());
    return this.http.get<DonationModel[]>(`${environment.apiUrl}/campaign/${CampaignId}/donations`, {params});
  }

  create(Campaign: CampaignModel) {
    return this.http.post<CampaignModel>(`${environment.apiUrl}/campaign`, Campaign);
  }

  update(Campaign: CampaignModel) {
    return this.http.put<CampaignModel>(`${environment.apiUrl}/campaign`, Campaign);
  }

  validate() {
    return this.http.post(`${environment.apiUrl}/campaign/validate`, {});
  }

  join(id: number) {
    return this.http.post(`${environment.apiUrl}/campaign/${id}/join`, {});
  }

}
