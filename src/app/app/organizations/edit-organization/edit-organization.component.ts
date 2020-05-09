import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrganizationService } from 'src/app/_services/organization.service';
import { Content } from 'src/app/_models';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UserService, PagerService } from 'src/app/_services';
import { Router, ActivatedRoute } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { ContentService } from 'src/app/_services/content.service';
import { Organization, User } from 'src/app/_entities';

declare function startSimpleMDE(): any;

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.css']
})
export class EditOrganizationComponent implements OnInit {

  // Data
  id: number;
  organization: Organization = new Organization();

  // Forms
  editOrgForm: FormGroup = this.formBuilder.group({
    name: [this.organization.name, Validators.required]
  });
  addMemberOrgForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required]
  });
  editMemberRolesForm: FormGroup = this.formBuilder.group({
    isUserSponsor: [false, Validators.required],
    isUserManager: [false, Validators.required],
    iserUserOwner: [false, Validators.required]
  });
  contentForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    value: ['']
  });
  submitting: boolean;
  submittingEmail: boolean;
  addStatus: string = 'idle';
  submitStatus: string = 'idle';

  // Content modal
  modalRef: BsModalRef;
  private simplemde;
  contentId: number;

  // Members pagination
  private rawResponseMembers: any;
  pagerMembers: any = {};
  pagedItemsMembers: any[];
  pageSizeMembers: number = 10;

  // Contents pagination
  private rawResponseContents: any;
  pagerContents: any = {};
  pagedItemsContents: any[];
  pageSizeContents: number = 10;

  // Slack oauth
  slackSyncStatus: string = 'idle';
  slackDisconnectStatus: string = 'idle';
  slackClientId: string;
  redirectUrlOAuth: string;
  code: string;

  endPointEdit: string = '/organizations/edit/' + this.id;
  slackEndPoint: string = '/organizations/edit/slack/' + this.id
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private contentService: ContentService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private modalService: BsModalService
  ) {
    this.route.params.subscribe(params => this.id = <number>params.id);
    this.ngOnInit();
  }

  setRedirectUrlOAuth(id: number) {
    var endPointEdit = '/organizations/edit/' + id;
    var slackEndPoint = '/organizations/edit/slack/' + id;
    
    if (this.router.url.startsWith(endPointEdit)
      && !this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlOAuth = location.href.replace(endPointEdit, slackEndPoint);
    }
    if (this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlOAuth = location.href.replace(/\?code.*/, "").replace(/&code.*/, "");
    }
  }

  ngOnInit() {
    if (this.id > 0) {
      this.setRedirectUrlOAuth(this.id);
      var slackEndPoint = '/organizations/edit/slack/' + this.id;
      if (this.router.url.startsWith(slackEndPoint)) {
        this.code = this.route.snapshot.queryParams['code'];
        this.organizationService.slack(this.id, this.code, this.redirectUrlOAuth)
          .subscribe(() => {
            this.ngOnInit();
          });
      }
      this.slackClientId = environment.slackClientId;

      this.organizationService.getById(this.id)
        .subscribe(
          organization => {
            this.organization = Organization.fromModel(organization);
            this.refreshAuthorities();
            this.refreshForm();
            this.refreshMembers();
            this.refreshContents();
          },
          error => {
            console.log(error);
          });
    } else {
      this.refreshForm();
    }
  }

  refreshAuthorities() {
    this.organizationService.getOrganizationAuthorities(this.id)
      .subscribe(
        organizationAuthorities => {
          this.organization.organizationAuthorities = organizationAuthorities;
        }
      )
  }

  refreshForm() {
    this.editOrgForm.controls.name.setValue(this.organization.name);
    if (!(this.id > 0)) {
      this.organization.members = [];
      var user = JSON.parse(localStorage.getItem('currentUser'));
      if (user !== null) {
        this.organization.members.push(JSON.parse(localStorage.getItem('currentUser')));
      }
    }
  }

  refreshMembers(page: number = 1) {
    if (this.pagerService.canChangePage(this.pagerMembers, page)) {
      this.organizationService.getMembers(this.organization.id, page - 1, this.pageSizeMembers)
        .subscribe(response => {
          this.rawResponseMembers = response;
          this.setMembersPage(page);
        });
    }
  }

  setMembersPage(page: number) {
    this.pagerMembers = this.pagerService.getPager(this.rawResponseMembers.totalElements, page, this.pageSizeMembers);
    this.pagedItemsMembers = this.rawResponseMembers.content;
    for (var k = 0; k < this.pagedItemsMembers.length; k++) {
      this.pagedItemsMembers[k] = User.fromModel(this.pagedItemsMembers[k]);
      this.pagedItemsMembers[k].isUserSponsor = this.pagedItemsMembers[k].userOrganizationAuthorities.find(authority => authority.name === 'ROLE_SPONSOR') !== undefined
      this.pagedItemsMembers[k].isUserManager = this.pagedItemsMembers[k].userOrganizationAuthorities.find(authority => authority.name === 'ROLE_MANAGER') !== undefined
      this.pagedItemsMembers[k].isUserOwner = this.pagedItemsMembers[k].userOrganizationAuthorities.find(authority => authority.name === 'ROLE_OWNER') !== undefined
    }
  }

  refreshContents(page: number = 1) {
    this.contentService.getByOrganizationId(this.organization.id, page - 1, this.pageSizeContents)
      .subscribe(contents => {
        this.rawResponseContents = contents;
        this.setContentsPage(page);
      });
  }

  setContentsPage(page: number) {
    this.pagerContents = this.pagerService.getPager(this.rawResponseContents.totalElements, page, this.pageSizeContents);
    this.pagedItemsContents = this.rawResponseContents.content;
    for (var k = 0; k < this.pagedItemsContents.length; k++) {
      this.pagedItemsContents[k] = this.pagedItemsContents[k];
    }
  }

  openContentModal(template: TemplateRef<any>, content) {
    this.modalRef = this.modalService.show(template);
    this.contentForm.controls['name'].setValue(content.name);
    this.contentId = content.id;
    if (typeof startSimpleMDE === 'function') {
      this.simplemde = startSimpleMDE();
      this.simplemde.value(content.value);
    }
  }

  onSlackSync() {
    this.slackSyncStatus = 'running';
    if (this.id > 0) {
      this.organizationService.slackSync(this.id)
        .subscribe(
          () => {
            this.slackSyncStatus = 'success';
            this.pagerMembers.currentPage = undefined;
            this.refreshMembers();
            setTimeout(() => {
              this.slackSyncStatus = 'idle';
            }, 2000);
          },
          error => {
            this.slackSyncStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.slackSyncStatus = 'idle';
            }, 2000);
          });
    }
  }

  onSlackDisconnect() {
    this.slackDisconnectStatus = 'running';
    if (this.id > 0 && this.organization.slackTeam != null && this.organization.slackTeam != undefined) {
      this.organizationService.slackDisconnect(this.id, this.organization.slackTeam.id)
        .subscribe(
          () => {
            this.slackDisconnectStatus = 'success';
            this.pagerMembers.currentPage = undefined;
            this.refreshForm();
            this.refreshMembers();
            setTimeout(() => {
              this.slackDisconnectStatus = 'idle';
            }, 2000);
          },
          error => {
            this.slackDisconnectStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.slackDisconnectStatus = 'idle';
            }, 2000);
          });
    }
  }

  onSubmitContent() {
    if (this.contentForm.invalid) {
      return;
    }

    var content = new Content();
    content.name = this.contentForm.controls['name'].value;
    content.value = this.simplemde.value();

    var org = new Organization();
    org.id = this.organization.id;
    content.organizations = [org];

    if (this.contentId > 0) {
      content.id = this.contentId;
      this.contentService.update(content)
        .subscribe(
          () => {
            this.modalRef.hide();
            this.refreshContents(this.pagerContents.currentPage);
          },
          error => {
            console.log(error);
          });
    } else {
      this.contentService.create(content)
        .subscribe(
          () => {
            this.modalRef.hide();
            this.refreshContents(this.pagerContents.currentPage);
          },
          error => {
            console.log(error);
          }
        );
    }
  }

  onSubmitEmail() {
    if (this.addMemberOrgForm.invalid) {
      return;
    }
    this.userService.getByEmail(this.addMemberOrgForm.controls.email.value)
      .subscribe(
        response => {
          var user = User.fromModel(response);
          this.organizationService.addMember(this.organization.id, user.id)
            .subscribe(
              () => {
                this.refreshMembers(this.pagerMembers.currentPage);
                this.addStatus = 'success';
                setTimeout(() => {
                  this.addStatus = 'idle';
                }, 2000);
              },
              error => {
                console.log(error);
                this.submitting = false;
                this.addStatus = 'error';
                setTimeout(() => {
                  this.addStatus = 'idle';
                }, 2000);
              }
            );
        },
        error => {
          console.log(error);
          this.submitting = false;
          this.addStatus = 'error';
          setTimeout(() => {
            this.addStatus = 'idle';
          }, 2000);
        });
  }

  onRemoveMember(user: User) {
    this.organizationService.removeMember(this.organization.id, user.id)
      .subscribe(() => {
        this.refreshMembers(this.pagerMembers.page);
      });
  }

  onRemoveContent(content: Content) {
    this.contentService.removeContent(this.organization.id, content.id)
      .subscribe(() => {
        this.refreshContents(this.pagerContents.page);
      });
  }

  grant(userId: number, role: string) {
    var organizationAuthority = this.organization.organizationAuthorities.find(authority => authority.name === role);
    this.userService.grant(userId, organizationAuthority)
      .subscribe(() => {
        this.refreshMembers(this.pagerMembers.currentPage);
      })
  }

  get f() { return this.editOrgForm.controls; }

  onSubmit() {

    // stop here if form is invalid
    if (this.editOrgForm.invalid) {
      return;
    }

    var organization2save = new Organization();
    organization2save.name = this.f.name.value;
    //organization2save.members = this.organization.members;

    if (this.id > 0) {
      organization2save.id = this.id;
      this.organizationService.update(organization2save)
        .subscribe(
          () => {
            this.submitting = false;
            this.submitStatus = 'success';
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          },
          error => {
            console.log(error);
            this.submitting = false;
            this.submitStatus = 'error';
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          });
    } else {
      this.organizationService.create(organization2save)
        .subscribe(
          response => {
            this.submitting = false;
            this.submitStatus = 'success';
            window.location.href = "/organizations/edit/" + response['id']
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          },
          error => {
            console.log(error);
            this.submitting = false;
            this.submitStatus = 'error';
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          });
    }

  }

}
