import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { User } from '../_models';

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
        return this.http.get(`${environment.apiUrl}/user/${id}`);
    }

    register(user: User) {
        return this.http.post(`${environment.apiUrl}/user/register`, user);
    }

    update(user: User) {
        return this.http.put(`${environment.apiUrl}/user/${user.id}`, user);
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/user/${id}`);
    }
}