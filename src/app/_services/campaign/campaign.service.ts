import { Injectable } from '@angular/core';
import { CampaignModel, DataPage, DonationModel } from '../../_models';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConfigService } from '../config/config.service';

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

  getDonations(CampaignId: number, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get<DataPage<DonationModel>>(`${this.configService.get('apiUrl')}/campaign/${CampaignId}/donations`, { params });
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

}
