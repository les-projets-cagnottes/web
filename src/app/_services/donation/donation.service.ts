import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DonationModel } from '../../_models';

import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  create(donation: DonationModel): Observable<void> {
      return this.http.post<void>(`${this.configService.get('apiUrl')}/donation`, donation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.get('apiUrl')}/donation/${id}`);
  }

}
