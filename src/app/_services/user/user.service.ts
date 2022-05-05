import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConfigService } from '../config/config.service';

import { AccountModel, DonationModel, UserModel, OrganizationModel, OrganizationAuthorityModel, AuthorityModel } from '../../_models';

import { ProjectModel } from '../../_models/project/project.model';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private http: HttpClient, private configService: ConfigService) { }

    list(offset: number, limit: number) {
        const params = new HttpParams()
            .set('offset', offset.toString())
            .set('limit', limit.toString());
        return this.http.get<UserModel[]>(`${this.configService.get('apiUrl')}/user`, { params });
    }

    getById(id: number) {
        return this.http.get<UserModel>(`${this.configService.get('apiUrl')}/user/${id}`);
    }

    getAllByIds(ids: number[]) {
        const params = new HttpParams()
            .set('ids', ids.toString());
        return this.http.get<UserModel[]>(`${this.configService.get('apiUrl')}/user`, { params });
    }

    getByEmail(email: string) {
        return this.http.get<UserModel>(`${this.configService.get('apiUrl')}/user?email=${email}`);
    }

    getByBudgetId(budgetId: any, offset: number, limit: number) {
        const params = new HttpParams()
            .set('budgetId', budgetId)
            .set('offset', offset)
            .set('limit', limit);
        return this.http.get<UserModel[]>(`${this.configService.get('apiUrl')}/user`, { params });
    }

    getAccounts(id: number) {
        return this.http.get<AccountModel[]>(`${this.configService.get('apiUrl')}/user/${id}/accounts`);
    }

    getAccountsByBudgetIds(id: number, budgetIds: number[]) {
        const params = new HttpParams()
            .set('budgetIds', budgetIds.toString());
        return this.http.get<AccountModel[]>(`${this.configService.get('apiUrl')}/user/${id}/accounts`, { params });
    }

    getProjects(id: number) {
        return this.http.get<ProjectModel[]>(`${this.configService.get('apiUrl')}/user/${id}/projects`);
    }

    getDonations(id: number) {
        return this.http.get<DonationModel[]>(`${this.configService.get('apiUrl')}/user/${id}/donations`);
    }

    getDonationsByAccountIds(id: number, accountIds: number[]) {
        const params = new HttpParams()
            .set('accountIds', accountIds.toString());
        return this.http.get<DonationModel[]>(`${this.configService.get('apiUrl')}/user/${id}/donations`, { params });
    }

    getOrganizations(id: number) {
        return this.http.get<OrganizationModel[]>(`${this.configService.get('apiUrl')}/user/${id}/organizations`);
    }

    create(user: UserModel) {
        return this.http.post(`${this.configService.get('apiUrl')}/user`, user);
    }

    update(user: UserModel) {
        return this.http.put(`${this.configService.get('apiUrl')}/user`, user);
    }

    delete(id: number) {
        return this.http.delete(`${this.configService.get('apiUrl')}/user/${id}`);
    }

    grant(id: number, authority: AuthorityModel) {
        return this.http.post(`${this.configService.get('apiUrl')}/user/${id}/authorities`, authority);
    }

    grantOrgAuthority(id: number, organizationAuthority: OrganizationAuthorityModel) {
        return this.http.post(`${this.configService.get('apiUrl')}/user/${id}/orgauthorities`, organizationAuthority);
    }
}