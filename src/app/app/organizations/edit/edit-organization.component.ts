import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrganizationService } from 'src/app/_services/organization.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UserService, PagerService } from 'src/app/_services';
import { Router, ActivatedRoute } from '@angular/router';

import { ContentService } from 'src/app/_services/content.service';
import { Organization, User, Content, SlackTeam } from 'src/app/_entities';
import { OrganizationAuthority } from 'src/app/_entities/organization.authority';
import { ContentModel, OrganizationModel } from 'src/app/_models';
import { SlackTeamService } from 'src/app/_services/slack.team.service';
import { ConfigService } from 'src/app/_services/config/config.service';

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
    name: [this.organization.name, Validators.required],
    logoUrl: [this.organization.logoUrl]
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

  // Slack oauth
  slackSyncStatus: string = 'idle';
  slackDisconnectStatus: string = 'idle';
  slackClientId: string;
  redirectUrlOAuth: string;
  code: string;

  // Members card
  private rawResponseMembers: any;
  pagerMembers: any = {};
  pagedItemsMembers: User[];
  pageSizeMembers: number = 10;
  refreshMembersStatus: string = 'idle';

  // Contents card
  private rawResponseContents: any;
  pagerContents: any = {};
  pagedItemsContents: any[];
  pageSizeContents: number = 10;
  refreshContentStatus: string = 'idle';

  // Content modal
  modalRef: BsModalRef;
  contentId: number;
  contentValueConfig = {
    height: '600px'
  }

  endPointEdit: string = '';
  slackEndPoint: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private pagerService: PagerService,
    private configService: ConfigService,
    private contentService: ContentService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private slackTeamService: SlackTeamService
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
      this.slackClientId = this.configService.get('slackClientId');

      this.organizationService.getById(this.id)
        .subscribe(
          organization => {
            this.organization = Organization.fromModel(organization);
            this.refreshAuthorities();
            this.refreshForm();
            this.refreshMembers();
            this.refreshContents();
            if (this.organization.slackTeam != null && this.organization.slackTeam != undefined) {
              this.refreshSlackTeam();
            }
          },
          error => {
            console.log(error);
          });
    } else {
      this.refreshForm();
    }
  }

  refreshInformations() {
    this.organizationService.getById(this.id)
      .subscribe(
        organization => {
          this.organization = Organization.fromModel(organization);
          this.refreshAuthorities();
          this.refreshForm();
          if (this.organization.slackTeam != null && this.organization.slackTeam != undefined) {
            this.refreshSlackTeam();
          }
        },
        error => {
          console.log(error);
        });
  }

  refreshAuthorities() {
    this.organizationService.getOrganizationAuthorities(this.id)
      .subscribe(
        organizationAuthorities => {
          this.organization.organizationAuthorities = OrganizationAuthority.fromModels(organizationAuthorities);
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
          this.refreshMembersStatus = 'success';
          setTimeout(() => {
            this.refreshMembersStatus = 'idle';
          }, 1000);
        }, error => {
          this.refreshMembersStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.refreshMembersStatus = 'idle';
          }, 1000);
        });
    }
  }

  setMembersPage(page: number) {
    this.pagerMembers = this.pagerService.getPager(this.rawResponseMembers.totalElements, page, this.pageSizeMembers);
    this.pagedItemsMembers = this.rawResponseMembers.content;
    for (var k = 0; k < this.pagedItemsMembers.length; k++) {
      this.pagedItemsMembers[k] = User.fromModel(this.pagedItemsMembers[k]);
      this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.forEach(userOrganizationAuthorityId => this.pagedItemsMembers[k].userOrganizationAuthorities.push(this.organization.organizationAuthorities.find(authority => authority.id === userOrganizationAuthorityId)));
      this.pagedItemsMembers[k].isUserSponsor = this.pagedItemsMembers[k].userOrganizationAuthorities.find(authority => authority.name === 'ROLE_SPONSOR') !== undefined
      this.pagedItemsMembers[k].isUserManager = this.pagedItemsMembers[k].userOrganizationAuthorities.find(authority => authority.name === 'ROLE_MANAGER') !== undefined
      this.pagedItemsMembers[k].isUserOwner = this.pagedItemsMembers[k].userOrganizationAuthorities.find(authority => authority.name === 'ROLE_OWNER') !== undefined
    }
  }

  refreshContents(page: number = 1) {
    this.refreshContentStatus = 'running';
    this.organizationService.getContents(this.organization.id, page - 1, this.pageSizeContents)
      .subscribe(contents => {
        this.rawResponseContents = contents;
        this.setContentsPage(page);
        this.refreshContentStatus = 'success';
        setTimeout(() => {
          this.refreshContentStatus = 'idle';
        }, 1000);
      }, error => {
        this.refreshContentStatus = 'error';
        console.log(error);
        setTimeout(() => {
          this.refreshContentStatus = 'idle';
        }, 1000);
      }
    );
  }

  setContentsPage(page: number) {
    this.pagerContents = this.pagerService.getPager(this.rawResponseContents.totalElements, page, this.pageSizeContents);
    this.pagedItemsContents = this.rawResponseContents.content;
    for (var k = 0; k < this.pagedItemsContents.length; k++) {
      this.pagedItemsContents[k] = this.pagedItemsContents[k];
    }
  }

  refreshSlackTeam() {
    this.slackTeamService.getById(this.organization.slackTeam.id)
      .subscribe(
        slackTeam => {
          this.organization.slackTeam = SlackTeam.fromModel(slackTeam);
        }
      )
  }

  openContentModal(template: TemplateRef<any>, content) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-xl' })
    );
    this.contentForm.controls['name'].setValue(content.name);
    this.contentForm.controls['value'].setValue(content.value);
    this.contentId = content.id;
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
      this.organizationService.slackDisconnect(this.id)
        .subscribe(
          () => {
            this.slackDisconnectStatus = 'success';
            this.pagerMembers.currentPage = undefined;
            this.refreshInformations();
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

    var content = new ContentModel();
    content.name = this.contentForm.controls['name'].value;
    content.value = this.contentForm.controls['value'].value;

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
      this.organizationService.addContent(this.organization.id, content)
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

    var organization = new OrganizationModel();
    organization.name = this.f.name.value;
    organization.logoUrl = this.f.logoUrl.value;
    if(organization.logoUrl === "") {
      organization.logoUrl = "https://eu.ui-avatars.com/api/?name=" + organization.name;
    }

    if (this.id > 0) {
      organization.id = this.id;
      this.organizationService.update(organization)
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
      this.organizationService.create(organization)
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
