import { Injectable } from '@angular/core';
import { AuthenticationService } from '..';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private authenticationService: AuthenticationService) { }

  getUploadPath(directory: string, isInOrg: boolean): string {
    var path = 'http://localhost:8080/api/files/image?directory=orgs/'
    if(isInOrg) {
      path+= this.authenticationService.currentOrganizationValue.id + '/'
    }
    path+= directory
    return path
  }

}
