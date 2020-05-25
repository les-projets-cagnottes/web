import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Role } from '../_models';
import { Organization, User } from '../_entities';
import { AuthenticationService, AuthorityService, OrganizationService, UserService } from '../_services';

@Component({
  selector: 'app-lesprojetscagnottes',
  templateUrl: './lesprojetscagnottes.component.html',
  styleUrls: ['./lesprojetscagnottes.component.css']
})
export class LesProjetsCagnottesComponent implements OnInit, OnDestroy {

  gitRef: string = '';
  gitShortRef: string = '';
  currentOrganization: Organization = new Organization();
  currentOrganizationSubscription: Subscription;
  currentUser: User = new User();
  currentUserSubscription: Subscription;
  users: User[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService
  ) { 
    this.gitRef = environment.gitRef;
    if(this.gitRef.length === 40) this.gitShortRef = ' @' + this.gitRef.substring(0, 7); 
    this.currentUser.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.currentOrganizationSubscription = this.authenticationService.currentOrganization.subscribe(organization => {
      if(organization !== null) {
        this.currentOrganization = organization;
      }
    });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.authenticationService.whoami()
      .subscribe(() => {
        this.organizationService.getById(this.currentOrganization.id)
          .subscribe(organizationModel => {
            this.authenticationService.setCurrentOrganization(Organization.fromModel(organizationModel));
          })
      });
  }
  
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  get isSponsor() {
    var isSponsor = this.currentUser != null && this.currentUser.userOrganizationAuthorities != null;
    isSponsor = isSponsor && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Sponsor);
    return isSponsor || this.isAdmin;
  }

  get isManager() {
    var isManager = this.currentUser != null && this.currentUser.userOrganizationAuthorities != null;
    isManager = isManager && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Manager);
    return isManager || this.isAdmin;
  }
  
  get isOwner() {
    var isOwner = this.currentUser != null && this.currentUser.userOrganizationAuthorities != null;
    isOwner = isOwner && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Owner);
    return isOwner || this.isAdmin;
  }

  get isAdmin() {
    var isAdmin = this.currentUser != null && this.currentUser.userAuthorities != null;
    return isAdmin && this.currentUser.userAuthorities.some(a => a.name === Role.Admin);
  }

}
