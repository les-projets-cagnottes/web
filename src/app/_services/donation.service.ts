import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DonationModel } from '../_models';

import { ConfigService } from '../_services/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  control() {
    return this.http.get(`${this.configService.get('apiUrl')}/donation`);
  }

  create(donation: DonationModel) {
      return this.http.post(`${this.configService.get('apiUrl')}/donation`, donation);
  }

  delete(id: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/donation/${id}`);
  }

}
