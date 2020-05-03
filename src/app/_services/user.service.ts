import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { User, Donation } from '../_models';
import { OrganizationAuthority } from '../_models/organizationAuthority';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private http: HttpClient) { }

    getAll(offset, limit) {
        const params = new HttpParams()
            .set('offset', offset)
            .set('limit', limit);
        return this.http.get<User[]>(`${environment.apiUrl}/user`, { params });
    }

    getById(id: number) {
        return this.http.get<User>(`${environment.apiUrl}/user/${id}`);
    }

    getAllByIds(ids: number[]) {
        const params = new HttpParams()
            .set('ids', ids.toString());
        return this.http.get<User[]>(`${environment.apiUrl}/user`, { params });
    }

    getByEmail(email: string) {
        return this.http.get<User>(`${environment.apiUrl}/user?email=${email}`);
    }

    getByBudgetId(budgetId: any, offset, limit) {
        const params = new HttpParams()
            .set('budgetId', budgetId)
            .set('offset', offset)
            .set('limit', limit);
        return this.http.get<User[]>(`${environment.apiUrl}/user`, { params });
    }

    getDonations(id: number) {
        return this.http.get<Donation[]>(`${environment.apiUrl}/user/${id}/donations`);
    }

    create(user: User) {
        return this.http.post(`${environment.apiUrl}/user`, user);
    }

    update(user: User) {
        return this.http.put(`${environment.apiUrl}/user/${user.id}`, user);
    }

    updateProfile(user: User) {
        return this.http.put(`${environment.apiUrl}/user/profile`, user);
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/user/${id}`);
    }

    grant(id: number, organizationAuthority: OrganizationAuthority) {
        return this.http.post(`${environment.apiUrl}/user/${id}/orgauthorities`, organizationAuthority);
    }

}