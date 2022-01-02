import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ContentModel } from '../../_models';

import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  getAll(offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<ContentModel[]>(`${this.configService.get('apiUrl')}/content`, { params });
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
      .set('ids', ids.toString());
    return this.http.get<ContentModel[]>(`${this.configService.get('apiUrl')}/content`, { params });
  }

  getById(id: number) {
    return this.http.get<ContentModel>(`${this.configService.get('apiUrl')}/content/${id}`);
  }

  create(content: ContentModel) {
    return this.http.post(`${this.configService.get('apiUrl')}/content`, content);
  }

  update(content: ContentModel) {
    return this.http.put<ContentModel>(`${this.configService.get('apiUrl')}/content`, content);
  }

  delete(id: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/content/${id}`);
  }
}
