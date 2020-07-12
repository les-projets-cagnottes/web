import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  constructor(private http: HttpClient) { }

  getFontAwesomeList() {
    return this.http.get<any[]>(`${environment.webUrl}/assets/font-awesome.json`);
  }

  getLogs() {
    return this.http.get(`${environment.apiUrl}/logs`, {responseType: 'text'});
  }

}