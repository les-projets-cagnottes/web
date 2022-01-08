import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AccountModel } from "src/app/_models";
import { ConfigService } from "../config/config.service";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private http: HttpClient, private configService: ConfigService) { }

  getAllByIds(ids: number[]) {
    const params = new HttpParams()
      .set('ids', ids.toString());
    return this.http.get<AccountModel[]>(`${this.configService.get('apiUrl')}/account`, { params });
  }

  getByBudgetAndUser(budgetId: number, userId: number) {
    const params = new HttpParams()
      .set('budgetId', budgetId)
      .set('userId', userId);
    return this.http.get<AccountModel>(`${this.configService.get('apiUrl')}/account`, { params });
  }
}
