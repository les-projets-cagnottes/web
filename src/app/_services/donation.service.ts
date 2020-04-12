import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Donation } from '../_models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(private http: HttpClient) { }

  create(donation: Donation) {
      return this.http.post(`${environment.apiUrl}/donation`, donation);
  }

  getbyBudgetId(budgetId: number) {
    return this.http.get<Donation[]>(`${environment.apiUrl}/donation?budgetId=${budgetId}`);
  }

  getByProjectId(projectId: number, offset: number, limit: number) {
    const params = new HttpParams()
        .set('projectId', projectId.toString())
        .set('offset', offset.toString())
        .set('limit', limit.toString());
    return this.http.get<Donation[]>(`${environment.apiUrl}/donation`, {params});
  }

  getByContributorId(contributorId: number) {
    return this.http.get<Donation[]>(`${environment.apiUrl}/donation?contributorId=${contributorId}`);
  }

  getByContributorIdAndBudgetId(contributorId: number, budgetId: number) {
    return this.http.get<Donation[]>(`${environment.apiUrl}/donation?contributorId=${contributorId}&budgetId=${budgetId}`);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/donation/${id}`);
  }

}
