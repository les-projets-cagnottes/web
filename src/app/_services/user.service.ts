import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { AccountModel, DonationModel, UserModel, CampaignModel, OrganizationAuthorityModel, OrganizationModel } from '../_models';

import { OrganizationAuthority } from '../_entities/organization.authority';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private http: HttpClient) { }

    list(offset: number, limit: number) {
        const params = new HttpParams()
            .set('offset', offset.toString())
            .set('limit', limit.toString());
        return this.http.get<UserModel[]>(`${environment.apiUrl}/user`, { params });
    }

    getById(id: number) {
        return this.http.get<UserModel>(`${environment.apiUrl}/user/${id}`);
    }

    getAllByIds(ids: number[]) {
        const params = new HttpParams()
            .set('ids', ids.toString());
        return this.http.get<UserModel[]>(`${environment.apiUrl}/user`, { params });
    }

    getByEmail(email: string) {
        return this.http.get<UserModel>(`${environment.apiUrl}/user?email=${email}`);
    }

    getByBudgetId(budgetId: any, offset, limit) {
        const params = new HttpParams()
            .set('budgetId', budgetId)
            .set('offset', offset)
            .set('limit', limit);
        return this.http.get<UserModel[]>(`${environment.apiUrl}/user`, { params });
    }

    getAccounts(id: number) {
        return this.http.get<AccountModel[]>(`${environment.apiUrl}/user/${id}/accounts`);
    }

    getCampaigns(id: number) {
        return this.http.get<CampaignModel[]>(`${environment.apiUrl}/user/${id}/campaigns`);
      }
    
    getDonations(id: number) {
        return this.http.get<DonationModel[]>(`${environment.apiUrl}/user/${id}/donations`);
    }
    
    getOrganizations(id: number) {
        return this.http.get<OrganizationModel[]>(`${environment.apiUrl}/user/${id}/organizations`);
    }

    create(user: UserModel) {
        return this.http.post(`${environment.apiUrl}/user`, user);
    }

    update(user: UserModel) {
        return this.http.put(`${environment.apiUrl}/user`, user);
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/user/${id}`);
    }

    grant(id: number, organizationAuthority: OrganizationAuthority) {
        return this.http.post(`${environment.apiUrl}/user/${id}/orgauthorities`, organizationAuthority);
    }

}