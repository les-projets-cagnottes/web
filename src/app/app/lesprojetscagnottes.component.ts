import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Role } from '../_models';
import { User } from '../_entities';
import { AuthenticationService } from '../_services';

@Component({
  selector: 'app-lesprojetscagnottes',
  templateUrl: './lesprojetscagnottes.component.html',
  styleUrls: ['./lesprojetscagnottes.component.css']
})
export class LesProjetsCagnottesComponent implements OnInit, OnDestroy {

  currentUser = new User();
  currentUserSubscription: Subscription;
  users: User[] = [];

  constructor(
    private authenticationService: AuthenticationService
  ) {
    this.currentUser.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.authenticationService.whoami()
      .subscribe(json => {
        this.currentUser = User.fromModel(json);
      });
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
