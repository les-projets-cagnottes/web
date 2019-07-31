import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Organization, User } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(private http: HttpClient) { }

  create(organization: Organization) {
    return this.http.post(`${environment.apiUrl}/organization`, organization);
  }

  getByMember(member: User) {
    return this.http.get(`${environment.apiUrl}/organization?member_id=${member.id}`);
  }

}
