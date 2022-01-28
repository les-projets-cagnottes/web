import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsTeamModel } from 'src/app/_models/ms-team/ms-team.model';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class MsTeamService {

  constructor(private http: HttpClient, private configService: ConfigService) { }

  getById(id: number) {
    return this.http.get<MsTeamModel>(`${this.configService.get('apiUrl')}/team/ms/${id}`);
  }

  create(team: MsTeamModel) {
    return this.http.post(`${this.configService.get('apiUrl')}/team/ms`, team);
  }
  
  delete(id: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/team/ms/${id}`, {});
  }
}
