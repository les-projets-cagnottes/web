import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { Role } from '../_models';
import { Organization, User } from '../_entities';
import { AuthenticationService, OrganizationService, UserService } from '../_services';
import { ConfigService } from '../_services/config/config.service';

@Component({
  selector: 'app-lesprojetscagnottes',
  templateUrl: './lesprojetscagnottes.component.html',
  styleUrls: ['./lesprojetscagnottes.component.css']
})
export class LesProjetsCagnottesComponent implements OnInit, OnDestroy {

  public isCollapsed = false;
  version: string = '';
  versionUrl: string = '';
  currentOrganization: Organization = new Organization();
  currentOrganizationSubscription: Subscription;
  currentUser: User = new User();
  currentUserSubscription: Subscription;
  users: User[] = [];

  // Change Current Org Modal
  changeCurrentOrgModal: BsModalRef;
  userOrganizations: Organization[] = [];

  constructor(
    private modalService: BsModalService,
    private authenticationService: AuthenticationService,
    private configService: ConfigService,
    private organizationService: OrganizationService,
    private userService: UserService
  ) {
    this.version = this.configService.get('version');
    this.versionUrl = this.configService.get('versionUrl');
    this.currentUser.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.currentOrganizationSubscription = this.authenticationService.currentOrganization.subscribe(organization => {
      if (organization !== null) {
        this.currentOrganization = organization;
      }
    });
  }

  ngOnInit() {
    this.refresh();
    this.refreshOrganizations();
  }

  refresh() {
    this.authenticationService.whoami()
      .subscribe(() => {
        this.organizationService.getById(this.currentOrganization.id)
          .subscribe(organizationModel => {
            this.authenticationService.setCurrentOrganization(Organization.fromModel(organizationModel));
          });
      });
  }

  refreshOrganizations() {
    this.userService.getOrganizations(this.currentUser.id)
      .subscribe(organizations => {
        this.userOrganizations = Organization.fromModels(organizations);
        this.currentOrganization = this.authenticationService.currentOrganizationValue;
        var currentOrganizationIndex = organizations.findIndex(org => org.id === this.currentOrganization.id);
        if(currentOrganizationIndex >= 0) {
          this.userOrganizations[currentOrganizationIndex].isCurrent = true;
        }
      });
  }

  setCurrentOrganization(organization: Organization) {
    this.authenticationService.setCurrentOrganization(organization);
    window.location.reload();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
    this.currentOrganizationSubscription.unsubscribe();
  }

  openChangeCurrentOrgModal(template): void {
    this.changeCurrentOrgModal = this.modalService.show(template);
  }

  closeChangeCurrentOrgModal() {
    this.changeCurrentOrgModal.hide();
  }

  get notCurrentOrg() {
    return this.userOrganizations.filter(org => org.id !== this.currentOrganization.id);
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
