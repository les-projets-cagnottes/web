import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '..';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private configService: ConfigService) { }

  getUploadPath(directory: string, isInOrg: boolean): string {
    var path = 'http://localhost:8080/api/files/image?directory=orgs/'
    if(isInOrg) {
      path+= this.authenticationService.currentOrganizationValue.id + '/'
    }
    path+= directory
    return path
  }

  deleteByUrl(url: string) {
    const params = new HttpParams()
        .set('url', url);
    return this.http.delete(`${ this.configService.get('apiUrl') }/files`, { params });
  }

}
