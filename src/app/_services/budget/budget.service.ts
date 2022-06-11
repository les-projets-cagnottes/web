import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AccountModel, BudgetModel, CampaignModel, DataPage, UserModel } from '../../_models';

import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private http: HttpClient, private configService: ConfigService) { }

  getByIsActive(isActive: boolean) {
    return this.http.get<BudgetModel[]>(`${this.configService.get('apiUrl')}/budget?isActive=${isActive}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
        .set('ids', ids.toString());
    return this.http.get<BudgetModel[]>(`${this.configService.get('apiUrl')}/budget`, { params });
}

  getAccounts(budgetId: number, offset: number, limit: number) {
    const params = new HttpParams()
        .set('offset', offset)
        .set('limit', limit);
    return this.http.get<DataPage<AccountModel>>(`${this.configService.get('apiUrl')}/budget/${budgetId}/accounts`, { params });
  }
  
  getUsers(budgetId: number) {
    return this.http.get<UserModel[]>(`${this.configService.get('apiUrl')}/budget/${budgetId}/users`);
  }
  
  getCampaigns(budgetId: number, offset: number, limit: number) {
    const params = new HttpParams()
        .set('offset', offset)
        .set('limit', limit);
    return this.http.get<DataPage<CampaignModel>>(`${this.configService.get('apiUrl')}/budget/${budgetId}/campaigns`, { params });
  }

  create(budget: BudgetModel) {
    return this.http.post(`${this.configService.get('apiUrl')}/budget`, budget);
  }

  save(budget: BudgetModel) {
    return this.http.put(`${this.configService.get('apiUrl')}/budget`, budget);
  }

  distribute(id: number) {
    return this.http.post(`${this.configService.get('apiUrl')}/budget/${id}/distribute`, {});
  }

  delete(id: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/budget/${id}`);
  }

}
