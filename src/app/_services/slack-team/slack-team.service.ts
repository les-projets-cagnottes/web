import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import { ConfigService } from '../config/config.service';
import { SlackTeamModel } from 'src/app/_models';

@Injectable({
  providedIn: 'root'
})
export class SlackTeamService {
  constructor(private http: HttpClient, private configService: ConfigService) {
  }

  getById(id: number) {
    return this.http.get<SlackTeamModel>(`${this.configService.get('apiUrl')}/team/slack/${id}`);
  }

  update(slackTeam: SlackTeamModel) {
    return this.http.put(`${this.configService.get('apiUrl')}/team/slack`, slackTeam);
  }

}
