import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../_services/config/config.service';
import { ApiToken } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ApiTokenService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  getAll() {
    return this.http.get<ApiToken[]>(`${this.configService.get('apiUrl')}/token`);
  }

  generateApiToken() {
    return this.http.post<ApiToken>(`${this.configService.get('apiUrl')}/token`, {});
}

  delete(id: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/token/${id}`);
  }

}
