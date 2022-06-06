import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private appConfig = new Map<string, string>();

  constructor(private _http: HttpClient) { }

  loadConfig() {
    return this._http
      .get<MapType>('./assets/config.json')
      .toPromise()
      .then((res) => {
        for (const i in res) {
          this.appConfig.set(i, res[i]);
        }
      });
  }

  get(key: string): string {
    return this.appConfig.get(key) || '';
  }

}

type MapType = { 
  [id: string]: string; 
}