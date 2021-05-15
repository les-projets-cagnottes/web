import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from '../_services/config/config.service';

import { IdeaModel } from '../_models';

@Injectable({ providedIn: 'root' })
export class IdeaService {
    constructor(private http: HttpClient, private configService: ConfigService) { }

    create(idea: IdeaModel) {
        return this.http.post(`${this.configService.get('apiUrl')}/idea`, idea);
    }

    update(idea: IdeaModel) {
        return this.http.put(`${this.configService.get('apiUrl')}/idea`, idea);
    }

}