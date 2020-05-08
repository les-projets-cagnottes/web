import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DonationModel } from '../_models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(private http: HttpClient) { }

  create(donation: DonationModel) {
      return this.http.post(`${environment.apiUrl}/donation`, donation);
  }

  getbyBudgetId(budgetId: number) {
    return this.http.get<DonationModel[]>(`${environment.apiUrl}/donation?budgetId=${budgetId}`);
  }

  getByContributorId(contributorId: number) {
    return this.http.get<DonationModel[]>(`${environment.apiUrl}/donation?contributorId=${contributorId}`);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/donation/${id}`);
  }

}
