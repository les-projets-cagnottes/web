import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Schedule } from '../_entities/schedule';
import { ScheduleModel } from '../_models';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<ScheduleModel[]>(`${environment.apiUrl}/schedule`);
    }

    status(ids: number[]) {
        const params = new HttpParams()
            .set('ids', ids.toString());
        return this.http.get(`${environment.apiUrl}/schedule/status`, { params });
    }
}