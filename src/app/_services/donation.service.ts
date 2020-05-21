import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DonationModel } from '../_models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(private http: HttpClient) { }

  control() {
    return this.http.get(`${environment.apiUrl}/donation`);
  }

  create(donation: DonationModel) {
      return this.http.post(`${environment.apiUrl}/donation`, donation);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/donation/${id}`);
  }

}
