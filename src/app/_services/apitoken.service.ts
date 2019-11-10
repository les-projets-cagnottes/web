import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiToken } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ApiTokenService {
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<ApiToken[]>(`${environment.apiUrl}/token`);
  }

  generateApiToken() {
    return this.http.post<ApiToken>(`${environment.apiUrl}/token`, {});
}

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/token/${id}`);
  }

}
