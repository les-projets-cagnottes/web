import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { v4 as uuidv4 } from 'uuid';

import { ContentService, FileService, OrganizationService, PagerService, SlackTeamService, UserService } from 'src/app/_services';
import { Organization, User, Content, SlackTeam, MsTeam } from 'src/app/_entities';
import { OrganizationAuthority } from 'src/app/_entities/organization-authority/organization-authority';
import { ContentModel, OrganizationAuthorityModel, OrganizationModel } from 'src/app/_models';
import { ConfigService } from 'src/app/_services/config/config.service';
import { MsTeamService } from 'src/app/_services/ms-team/ms-team.service';
import { MsTeamModel } from 'src/app/_models/ms-team/ms-team.model';

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.css']
})
export class EditOrganizationComponent implements OnInit {

  // Data
  id: number = 0;
  organization: Organization = new Organization();
  authorities: Map<string, OrganizationAuthorityModel> = new Map<string, OrganizationAuthorityModel>();

  // Slack OAuth
  slackSyncStatus: string = 'idle';
  slackDisconnectStatus: string = 'idle';
  slackClientId: string = '';
  redirectUrlSlackOAuth: string = '';
  code: string = '';

  // Microsoft OAuth
  microsoftEnabled: boolean = false;
  microsoftSyncStatus: string = 'idle';
  microsoftDisconnectStatus: string = 'idle';
  microsoftTenantId: string = '';
  microsoftClientId: string = '';
  microsoftState: string = '';
  microsoftRedirectUrl: string = '';
  microsoftCode: string = '';
  msDisconnectStatus: string = 'idle';
  msTeam: MsTeamModel = new MsTeamModel();

  // Forms
  editOrgForm: FormGroup = this.formBuilder.group({
    name: [this.organization.name, Validators.required],
    logoUrl: [this.organization.logoUrl],
    msPublicationGroupId: [this.msTeam.groupId],
    msPublicationChannelId: [this.msTeam.channelId],
    msCompanyFilter: [this.msTeam.companyFilter]
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
  submitting: boolean = false;
  submittingEmail: boolean = false;
  addStatus: string = 'idle';
  submitStatus: string = 'idle';

  // Members card
  private rawResponseMembers: any;
  pagerMembers: any = {};
  pagedItemsMembers: User[] = [];
  pageSizeMembers: number = 10;
  refreshMembersStatus: string = 'idle';

  // Contents card
  private rawResponseContents: any;
  pagerContents: any = {};
  pagedItemsContents: any[] = [];
  pageSizeContents: number = 10;
  refreshContentStatus: string = 'idle';

  // Content modal
  modalRef: BsModalRef = new BsModalRef();
  contentId: number = 0;
  contentValueConfig = {
    height: 600,
    uploadImagePath: ''
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
    private fileService: FileService,
    private userService: UserService,
    private msTeamService: MsTeamService,
    private organizationService: OrganizationService,
    private slackTeamService: SlackTeamService
  ) {
    this.route.params.subscribe(params => this.id = <number>params['id']);
  }

  setredirectUrlSlackOAuth(id: number) {
    var endPointEdit = '/organizations/edit/' + id;
    var slackEndPoint = '/organizations/edit/slack/' + id;

    if (this.router.url.startsWith(endPointEdit)
      && !this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlSlackOAuth = location.href.replace(endPointEdit, slackEndPoint);
    }
    if (this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlSlackOAuth = location.href.replace(/\?code.*/, "").replace(/&code.*/, "");
    }
  }

  setMicrosoftRedirectUrl(id: number) {
    var currentEndPoint = /\/organizations\/edit\/.*/;
    var finalEndPoint = '/organizations/edit/microsoft';
    this.microsoftRedirectUrl = location.href.replace(currentEndPoint, finalEndPoint);
  }

  ngOnInit() {
    this.route.queryParamMap
      .subscribe((params) => {
        var state = Number(params.get('state'));
        if(state > 0) {
          var msTeam = new MsTeamModel();
          msTeam.organization.id = state;
          msTeam.tenantId = this.configService.get('microsoftTenantId');
          this.msTeamService.create(msTeam)
            .subscribe(response => {
              this.rawResponseMembers = response;
              this.router.navigate(['/organizations/edit/' + state]);
            }, error => {
              console.log(error);
            });
        }
      }
    );
    if (this.id > 0) {
      this.setredirectUrlSlackOAuth(this.id);
      var slackEndPoint = '/organizations/edit/slack/' + this.id;
      if (this.router.url.startsWith(slackEndPoint)) {
        this.code = this.route.snapshot.queryParams['code'];
        this.slackTeamService.create(this.id, this.code, this.redirectUrlSlackOAuth)
          .subscribe(() => {
            this.refreshInformations();
            this.refreshMembers();
          });
      }
      this.slackClientId = this.configService.get('slackClientId');

      this.microsoftEnabled = (/true/i).test(this.configService.get('microsoftEnabled'));
      if (this.microsoftEnabled) {
        this.microsoftTenantId = this.configService.get('microsoftTenantId');
        this.microsoftClientId = this.configService.get('microsoftClientId');
        this.microsoftState = this.id.toString();
        this.setMicrosoftRedirectUrl(this.id);
      }

      this.refreshInformations();
      this.refreshMembers();
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
          this.refreshSlackTeam();
          this.refreshMsTeam();
          this.refreshContents();
        },
        error => {
          console.log(error);
        });
  }

  refreshAuthorities() {
    this.organizationService.getOrganizationAuthorities(this.id)
      .subscribe(
        organizationAuthorities => {
          organizationAuthorities.forEach(authority => {
            this.authorities.set(authority.name, authority);
          })
          this.organization.organizationAuthorities = OrganizationAuthority.fromModels(organizationAuthorities);
        }
      )
  }

  refreshForm() {
    this.editOrgForm.controls['name'].setValue(this.organization.name);
    if (!(this.id > 0)) {
      this.organization.members = [];
      var currentUser = localStorage.getItem('currentUser');
      if (currentUser !== null) {
        var user = JSON.parse(currentUser);
        if (user !== null) {
          this.organization.members.push(JSON.parse(currentUser));
        }
      }
    }
  }

  refreshMembers(page: number = 1) {
    if (this.pagerService.canChangePage(this.pagerMembers, page)) {
      this.organizationService.getMembers(this.id, page - 1, this.pageSizeMembers)
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
      this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.forEach(userOrganizationAuthorityId => {
        var orgAuthorityFound = this.organization.organizationAuthorities.find(authority => authority.id === userOrganizationAuthorityId);
        if (orgAuthorityFound !== undefined) {
          this.pagedItemsMembers[k].userOrganizationAuthorities.push(orgAuthorityFound)
        }
      });
      if (this.pagedItemsMembers[k].userOrganizationAuthorities.length > 0) {
        var sponsorAuthority = this.authorities.get('ROLE_SPONSOR');
        var managerAuthority = this.authorities.get('ROLE_MANAGER');
        var ownerAuthority = this.authorities.get('ROLE_OWNER');
        if (sponsorAuthority !== undefined && managerAuthority !== undefined && ownerAuthority !== undefined) {
          var sponsorAuthorityId = sponsorAuthority.id;
          var managerAuthorityId = managerAuthority.id;
          var ownerAuthorityId = ownerAuthority.id;
          this.pagedItemsMembers[k].isUserSponsor = this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.find(authorityId => sponsorAuthorityId == authorityId) !== undefined
          this.pagedItemsMembers[k].isUserManager = this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.find(authorityId => managerAuthorityId == authorityId) !== undefined
          this.pagedItemsMembers[k].isUserOwner = this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.find(authorityId => ownerAuthorityId == authorityId) !== undefined
        }
      }
    }
  }

  refreshContents(page: number = 1, force: boolean = false) {
    if (this.pagerService.canChangePage(this.pagerContents, page) || force) {
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
  }

  setContentsPage(page: number) {
    this.pagerContents = this.pagerService.getPager(this.rawResponseContents.totalElements, page, this.pageSizeContents);
    this.pagedItemsContents = this.rawResponseContents.content;
    for (var k = 0; k < this.pagedItemsContents.length; k++) {
      this.pagedItemsContents[k] = this.pagedItemsContents[k];
    }
  }

  refreshSlackTeam() {
    if (this.organization.slackTeam != null 
      && this.organization.slackTeam != undefined 
      && this.organization.slackTeam.id > 0) {
      this.slackTeamService.getById(this.organization.slackTeam.id)
        .subscribe(
          slackTeam => {
            this.organization.slackTeam = SlackTeam.fromModel(slackTeam);
          }
        );
    }
  }

  refreshMsTeam() {
    console.log(this.organization.msTeam);
    if (this.organization.msTeam != null 
      && this.organization.msTeam != undefined 
      && this.organization.msTeam.id > 0) {
      this.msTeamService.getById(this.organization.msTeam.id)
        .subscribe(
          msTeam => {
            this.msTeam = msTeam;
          }
        );
    }
  }

  openNewContentModal(template: TemplateRef<any>) {
    this.openContentModal(template, new Content());
  }

  openContentModal(template: TemplateRef<any>, content: Content) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-xl' })
    );
    content.workspace = uuidv4();
    this.contentValueConfig.uploadImagePath = this.fileService.getUploadPath("contents/" + content.workspace, true);
    this.contentForm.controls['name'].setValue(content.name);
    this.contentForm.controls['value'].setValue(content.value);
    this.contentId = content.id;
  }

  onSlackSync() {
    this.slackSyncStatus = 'running';
    if (this.organization.slackTeam.id > 0) {
      this.slackTeamService.sync(this.organization.slackTeam.id)
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
      this.slackTeamService.delete(this.organization.slackTeam.id)
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

  onMsSync() {
    this.microsoftSyncStatus = 'running';
    if (this.id > 0) {
      this.msTeamService.sync(this.msTeam.id)
        .subscribe(
          () => {
            this.microsoftSyncStatus = 'success';
            this.pagerMembers.currentPage = undefined;
            this.refreshMembers();
            setTimeout(() => {
              this.microsoftSyncStatus = 'idle';
            }, 2000);
          },
          error => {
            this.microsoftSyncStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.microsoftSyncStatus = 'idle';
            }, 2000);
          });
    }
  }

  onMsDisconnect() {
    this.msDisconnectStatus = 'running';
    if (this.id > 0 && this.organization.msTeam != null && this.organization.msTeam != undefined) {
      this.msTeamService.delete(this.organization.msTeam.id)
        .subscribe(
          () => {
            this.msDisconnectStatus = 'success';
            this.pagerMembers.currentPage = undefined;
            this.refreshInformations();
            setTimeout(() => {
              this.msDisconnectStatus = 'idle';
            }, 2000);
          },
          error => {
            this.msDisconnectStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.msDisconnectStatus = 'idle';
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
    content.organization.id = this.organization.id;

    if (this.contentId > 0) {
      content.id = this.contentId;
      this.contentService.update(content)
        .subscribe(
          () => {
            this.modalRef.hide();
            this.refreshContents(this.pagerContents.page, true);
          },
          error => {
            console.log(error);
          });
    } else {
      this.contentService.create(content)
        .subscribe(
          () => {
            this.modalRef.hide();
            this.refreshContents(this.pagerContents.page, true);
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
    this.userService.getByEmail(this.addMemberOrgForm.controls['email'].value)
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
    this.contentService.delete(content.id)
      .subscribe(() => {
        this.refreshContents(this.pagerContents.page);
      });
  }

  grant(userId: number, role: string) {
    var organizationAuthority = this.organization.organizationAuthorities.find(authority => authority.name === role);
    if (organizationAuthority !== undefined) {
      this.userService.grantOrgAuthority(userId, organizationAuthority)
        .subscribe(() => {
          this.refreshMembers(this.pagerMembers.currentPage);
        });
    }
  }

  get f() { return this.editOrgForm.controls; }

  onSubmit() {

    // stop here if form is invalid
    if (this.editOrgForm.invalid) {
      return;
    }

    var organization = new OrganizationModel();
    organization.name = this.f['name'].value;
    organization.logoUrl = this.f['logoUrl'].value;
    if (organization.logoUrl === "") {
      organization.logoUrl = "https://eu.ui-avatars.com/api/?name=" + organization.name;
    }

    if(this.msTeam.id > 0) {
      this.msTeamService.update(this.msTeam)
        .subscribe(
          () => {},
          error => {
            console.log(error);
          }
        )
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
            window.location.href = "/organizations/edit/" + response.id
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

  onDeleteMedia(file: any) {
    this.fileService.deleteByUrl(file.url)
      .subscribe(
        () => { },
        error => {
          console.log(error);
        });
  }

}
