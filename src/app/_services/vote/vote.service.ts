import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { ScoreModel, VoteModel } from 'src/app/_models';

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(private http: HttpClient, private configService: ConfigService) { }

  getScoreByProjectId(projectId: number) {
    return this.http.get<ScoreModel>(`${this.configService.get('apiUrl')}/vote/score?projectId=${projectId}`);
  }
  
  getScoreByProjectIds(projectIds: number[]) {
    const params = new HttpParams()
      .set('projectIds', projectIds.toString());
    return this.http.get<ScoreModel[]>(`${this.configService.get('apiUrl')}/vote/score`, { params });
  }
  
  getUserVote(projectId: number) {
    return this.http.get<VoteModel>(`${this.configService.get('apiUrl')}/vote?projectId=${projectId}`);
  }
  
  vote(voteModel: VoteModel) {
    return this.http.post<VoteModel>(`${this.configService.get('apiUrl')}/vote`, voteModel);
  }

}
