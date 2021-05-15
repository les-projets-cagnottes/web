import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from '../_services/config/config.service';

import { AuthorityModel } from '../_models/authority.model';

@Injectable({ providedIn: 'root' })
export class AuthorityService {

    constructor(private http: HttpClient, private configService: ConfigService) { }
  
    getUserAuthorities() {
      return this.http.get<AuthorityModel[]>(`${this.configService.get('apiUrl')}/authorities`);
    }
  
}