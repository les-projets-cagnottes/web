import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { Role } from '../_models';
import { Organization, User } from '../_entities';
import { AuthenticationService, OrganizationService, UserService } from '../_services';
import { ConfigService } from '../_services/config/config.service';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-lesprojetscagnottes',
  templateUrl: './lesprojetscagnottes.component.html',
  styleUrls: ['./lesprojetscagnottes.component.css']
})
export class LesProjetsCagnottesComponent implements OnInit, OnDestroy {

  public isCollapsed = false;
  currentOrganization: Organization = new Organization();
  currentOrganizationSubscription: Subscription;
  currentUser: User = new User();
  currentUserSubscription: Subscription;
  users: User[] = [];

  // Change Current Org Modal
  changeCurrentOrgModal: BsModalRef = new BsModalRef();
  userOrganizations: Organization[] = [];

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService,
    private userService: UserService
  ) {
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

  setCurrentOrganization(organization: Organization) {
    this.authenticationService.setCurrentOrganization(organization);
    window.location.reload();
  }

  editOrganization(organization: Organization) {
    this.closeChangeCurrentOrgModal();
    this.router.navigate(['/organizations/edit/', organization.id]);
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
    this.currentOrganizationSubscription.unsubscribe();
  }

  openChangeCurrentOrgModal(template: TemplateRef<any>): void {
    this.userService.getOrganizations(this.currentUser.id)
      .subscribe(organizations => {
        this.userOrganizations = Organization.fromModels(organizations);
        this.currentOrganization = this.authenticationService.currentOrganizationValue;
        var currentOrganizationIndex = organizations.findIndex(org => org.id === this.currentOrganization.id);
        if(currentOrganizationIndex >= 0) {
          this.userOrganizations[currentOrganizationIndex].isCurrent = true;
        }
        this.changeCurrentOrgModal = this.modalService.show(template);
      });
  }

  closeChangeCurrentOrgModal() {
    this.changeCurrentOrgModal.hide();
  }

  isSponsor(): boolean {
    return (this.currentUser != null 
      && this.currentUser.userOrganizationAuthorities != null
      && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Sponsor && a.organization.id === this.currentOrganization.id))
      || this.isAdmin;
  }

  isManager(organization?: Organization): boolean {
    var isManager = this.currentUser != null && this.currentUser.userOrganizationAuthorities != null;
    if(organization !== undefined) {
      isManager = isManager && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Manager && a.organization.id === organization.id);
    } else {
      isManager = isManager && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Manager);
    }
    return isManager || this.isAdmin;
  }

  isOwner(organization?: Organization): boolean {
    var isOwner = this.currentUser != null && this.currentUser.userOrganizationAuthorities != null;
    if(organization !== undefined) {
      isOwner = isOwner && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Owner && a.organization.id === organization.id);
    } else {
      isOwner = isOwner && this.currentUser.userOrganizationAuthorities.some(a => a.name === Role.Owner);
    }
    return isOwner || this.isAdmin;
  }

  get isAdmin() {
    var isAdmin = this.currentUser != null && this.currentUser.userAuthorities != null;
    return isAdmin && this.currentUser.userAuthorities.some(a => a.name === Role.Admin);
  }

}
