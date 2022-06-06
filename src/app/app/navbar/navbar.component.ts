import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router"

import { AuthenticationService } from '../../_services';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class AppNavbarComponent implements OnInit {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    console.debug('Navbar component initialized');
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }

}
