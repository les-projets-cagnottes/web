import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from '../config/config.service';

import { AuthorityModel } from '../../_models/authority/authority.model';

@Injectable({ providedIn: 'root' })
export class AuthorityService {

    constructor(private http: HttpClient, private configService: ConfigService) { }
  
    list() {
      return this.http.get<AuthorityModel[]>(`${this.configService.get('apiUrl')}/authority`);
    }
  
}