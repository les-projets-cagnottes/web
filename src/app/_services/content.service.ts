import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Content } from '../_models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private http: HttpClient) { }

  getAll(offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<Content[]>(`${environment.apiUrl}/content`, { params });
  }

  create(content: Content) {
    return this.http.post(`${environment.apiUrl}/content`, content);
  }

  update(content: Content) {
    return this.http.put<Content>(`${environment.apiUrl}/content`, content);
  }

  getByOrganizationId(organizationId, offset, limit) {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit)
      .set('organizationId', organizationId);
    return this.http.get<Content[]>(`${environment.apiUrl}/content`, { params });
  }

  getAllByOrganizationId(organizationId) {
    const params = new HttpParams()
      .set('organizationId', organizationId);
    return this.http.get<Content[]>(`${environment.apiUrl}/content`, { params });
  }
  removeContent(organizationId: number, contentId: number) {
    return this.http.delete(`${environment.apiUrl}/organization/${organizationId}/contents?contentId=${contentId}`);
  }
}
