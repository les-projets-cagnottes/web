import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { IdeaModel } from '../_models';

@Injectable({ providedIn: 'root' })
export class IdeaService {
    constructor(private http: HttpClient) { }

    create(idea: IdeaModel) {
        return this.http.post(`${environment.apiUrl}/idea`, idea);
    }

    update(idea: IdeaModel) {
        return this.http.put(`${environment.apiUrl}/idea`, idea);
    }

}