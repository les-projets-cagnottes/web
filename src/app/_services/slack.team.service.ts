import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from '../_services/config/config.service';

import { SlackTeamModel } from '../_models/slack.team.model';

@Injectable({
  providedIn: 'root'
})
export class SlackTeamService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  getById(id: number) {
    return this.http.get<SlackTeamModel>(`${this.configService.get('apiUrl')}/team/slack/${id}`);
  }

}
