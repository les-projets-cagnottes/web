import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BudgetModel, DonationModel, CampaignModel } from '../_models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private http: HttpClient) { }

  getByIsActive(isActive: boolean) {
    return this.http.get<BudgetModel[]>(`${environment.apiUrl}/budget?isActive=${isActive}`);
  }

  getUsable() {
    return this.http.get<BudgetModel[]>(`${environment.apiUrl}/budget/usable`);
  }

  getAccounts(budgetId: any, offset, limit) {
    const params = new HttpParams()
        .set('offset', offset)
        .set('limit', limit);
    return this.http.get<CampaignModel[]>(`${environment.apiUrl}/budget/${budgetId}/accounts`, { params });
  }
  
  getDonations(BudgetModelId: number) {
    return this.http.get<DonationModel[]>(`${environment.apiUrl}/budget/${BudgetModelId}/donations`);
  }
  
  getDonationsByContributorId(contributorId: number, budgetId: number) {
    return this.http.get<DonationModel[]>(`${environment.apiUrl}/budget/${budgetId}/donations?contributorId=${contributorId}`);
  }

  getCampaigns(budgetId: any, offset, limit) {
    const params = new HttpParams()
        .set('offset', offset)
        .set('limit', limit);
    return this.http.get<CampaignModel[]>(`${environment.apiUrl}/budget/${budgetId}/campaigns`, { params });
  }

  create(budget: BudgetModel) {
    return this.http.post(`${environment.apiUrl}/budget`, budget);
  }

  updateAll(budget: BudgetModel[]) {
    return this.http.put(`${environment.apiUrl}/budget`, budget);
  }

  distribute(id: number) {
    return this.http.get(`${environment.apiUrl}/budget/${id}/distribute`);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/budget/${id}`);
  }

}
