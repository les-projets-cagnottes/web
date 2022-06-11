import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NewsModel } from 'src/app/_models';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(private http: HttpClient, private configService: ConfigService) { }

  getById(id: number) {
    return this.http.get<NewsModel>(`${this.configService.get('apiUrl')}/news/${id}`);
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
      .set('ids', ids.toString());
    return this.http.get<NewsModel[]>(`${this.configService.get('apiUrl')}/news`, { params });
  }

  create(project: NewsModel) {
    return this.http.post<NewsModel>(`${this.configService.get('apiUrl')}/news`, project);
  }

  update(project: NewsModel) {
    return this.http.put<NewsModel>(`${this.configService.get('apiUrl')}/news`, project);
  }

}
