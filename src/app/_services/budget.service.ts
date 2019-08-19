import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Budget } from '../_models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  constructor(private http: HttpClient) { }

  getAll(offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<Budget[]>(`${environment.apiUrl}/budget`, { params });
  }

  getByIsActive(isActive: boolean) {
    return this.http.get<Budget[]>(`${environment.apiUrl}/budget?isActive=${isActive}`);
  }

  getByOrganizationId(organizationId: number) {
    return this.http.get<Budget[]>(`${environment.apiUrl}/budget?organizationId=${organizationId}`);
  }

  create(budget: Budget) {
    return this.http.post(`${environment.apiUrl}/budget`, budget);
  }

  updateAll(budgets: Budget[]) {
    return this.http.put(`${environment.apiUrl}/budget`, budgets);
  }

  distribute(id: number) {
    return this.http.get(`${environment.apiUrl}/budget/${id}/distribute`);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/budget/${id}`);
  }

}
