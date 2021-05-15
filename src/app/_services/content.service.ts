import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ContentModel } from '../_models';

import { ConfigService } from '../_services/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  getAll(offset, limit) {
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

  update(content: ContentModel) {
    return this.http.put<ContentModel>(`${this.configService.get('apiUrl')}/content`, content);
  }

  getById(id) {
    return this.http.get<ContentModel>(`${this.configService.get('apiUrl')}/content/${id}`);
  }

  removeContent(organizationId: number, contentId: number) {
    return this.http.delete(`${this.configService.get('apiUrl')}/organization/${organizationId}/contents?contentId=${contentId}`);
  }
}
