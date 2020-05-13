import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router"

import { AuthenticationService } from '../../_services';
import { User } from 'src/app/_models';
import { OrganizationService } from 'src/app/_services/organization.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class AppNavbarComponent implements OnInit {

  currentUser = new User();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.currentUser.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.authenticationService.whoami()
      .subscribe(json => {
        this.currentUser.decode(json);
      });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }

}