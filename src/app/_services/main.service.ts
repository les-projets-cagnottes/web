import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from '../_services/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  getLogs() {
    return this.http.get(`${this.configService.get('apiUrl')}/logs`, {responseType: 'text'});
  }

}