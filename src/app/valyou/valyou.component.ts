import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from '../_models';
import { AuthenticationService } from '../_services';

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
    console.log("VALYOU");
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

}
