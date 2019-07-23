import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router"

import { AuthenticationService } from '../../_services';
import { User } from 'src/app/_models';

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
  }


  ngOnInit() {
    this.whoami();
  }

  whoami() {
    console.log("helo")
    this.authenticationService.whoami()
      .subscribe(user => this.currentUser = user);
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }

}
