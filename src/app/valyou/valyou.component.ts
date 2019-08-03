import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from '../_models';
import { AuthenticationService } from '../_services';
import { Role } from '../_models/role';

@Component({
  selector: 'app-valyou',
  templateUrl: './valyou.component.html',
  styleUrls: ['./valyou.component.css']
})
export class ValyouComponent implements OnInit, OnDestroy {

  currentUser: User;
  currentUserSubscription: Subscription;
  users: User[] = [];

  constructor(
    private authenticationService: AuthenticationService
  ) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  get isSponsor() {
    var isSponsor = this.currentUser != null && this.currentUser.userAuthorities != null;
    return isSponsor && this.currentUser.userAuthorities.some(a => a.name === Role.Admin);
  }

  get isAdmin() {
    var isAdmin = this.currentUser != null && this.currentUser.userAuthorities != null;
    return isAdmin && this.currentUser.userAuthorities.some(a => a.name === Role.Admin);
  }

}
