
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SlackTeamModel } from '../_models/slack.team.model';

@Injectable({
  providedIn: 'root'
})
export class SlackTeamService {
  constructor(private http: HttpClient) { }

  getById(id: number) {
    return this.http.get<SlackTeamModel>(`${environment.apiUrl}/team/slack/${id}`);
  }

}
