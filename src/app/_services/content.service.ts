import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ContentModel } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private http: HttpClient) { }

  getAll(offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<ContentModel[]>(`${environment.apiUrl}/content`, { params });
  }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
        .set('ids', ids.toString());
    return this.http.get<ContentModel[]>(`${environment.apiUrl}/content`, { params });
}

  update(content: ContentModel) {
    return this.http.put<ContentModel>(`${environment.apiUrl}/content`, content);
  }

  getById(id) {
    return this.http.get<ContentModel>(`${environment.apiUrl}/content/${id}`);
  }

  removeContent(organizationId: number, contentId: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${organizationId}/contents?contentId=${contentId}`);
  }
}
