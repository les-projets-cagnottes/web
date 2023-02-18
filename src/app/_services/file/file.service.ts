import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileModel } from 'src/app/_models';
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

  uploadImage(file: File, directory: string): Observable<any> {
    let formData = new FormData();
    formData.append("image", file, file.name);
    formData.append("directory", directory);
    return this.http.post<any>(`${this.configService.get('apiUrl')}/files/image`, formData);
  }

  getUploadPath(directory: string, isInOrg: boolean): string {
    let path = `orgs/`
    if (isInOrg) {
      path += this.authenticationService.currentOrganizationValue.id + '/'
    }
    path += directory
    return path
  }

  deleteByUrl(url: string) {
    const params = new HttpParams()
      .set('url', url);
    return this.http.delete(`${this.configService.get('apiUrl')}/files`, { params });
  }

}
