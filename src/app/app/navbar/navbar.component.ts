import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router"

import { AuthenticationService } from '../../_services';
import { NavService } from 'src/app/_services/nav/nav.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class AppNavbarComponent implements OnInit {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    public navService: NavService
  ) {
  }

  ngOnInit() {}

  logout() {
    this.authenticationService.logout();
  }

}
