import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConfigService } from '../_services/config/config.service';

import { ScheduleModel } from '../_models';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
    constructor(private http: HttpClient, private configService: ConfigService) { }

    getAll() {
        return this.http.get<ScheduleModel[]>(`${this.configService.get('apiUrl')}/schedule`);
    }

    status(ids: number[]) {
        const params = new HttpParams()
            .set('ids', ids.toString());
        return this.http.get(`${this.configService.get('apiUrl')}/schedule/status`, { params });
    }
}