import { Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { v4 as uuidv4 } from 'uuid';

import { ContentService, FileService, OrganizationService, PagerService, SlackTeamService, UserService } from 'src/app/_services';
import { Organization, User, SlackTeam } from 'src/app/_entities';
import { OrganizationAuthority } from 'src/app/_entities/organization-authority/organization-authority';
import { ContentModel, DataPage, OrganizationAuthorityModel, OrganizationModel, SlackTeamModel, UserModel } from 'src/app/_models';
import { ConfigService } from 'src/app/_services/config/config.service';
import { MsTeamService } from 'src/app/_services/ms-team/ms-team.service';
import { MsTeamModel } from 'src/app/_models/ms-team/ms-team.model';
import { Media } from 'src/app/_models/media/media';
import { Pager } from 'src/app/_models/pagination/pager/pager';

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.css']
})
export class EditOrganizationComponent implements OnInit {

  // Data
  id = 0;
  organization: Organization = new Organization();
  authorities: Map<string, OrganizationAuthorityModel> = new Map<string, OrganizationAuthorityModel>();

  // Slack OAuth
  slackSyncStatus = 'idle';
  slackDisconnectStatus = 'idle';
  slackClientId = '';
  redirectUrlSlackOAuth = '';
  code = '';

  // Microsoft OAuth
  microsoftEnabled = false;
  microsoftSyncStatus = 'idle';
  microsoftDisconnectStatus = 'idle';
  microsoftTenantId = '';
  microsoftClientId = '';
  microsoftState = '';
  microsoftRedirectUrl = '';
  microsoftCode = '';
  msDisconnectStatus = 'idle';
  msTeam: MsTeamModel = new MsTeamModel();

  // Forms
  editOrgForm: UntypedFormGroup = this.formBuilder.group({
    name: [this.organization.name, Validators.required],
    logoUrl: [this.organization.logoUrl],
    socialName: [this.organization.socialName],
    slackPublicationChannelId: [this.organization.slackTeam.publicationChannelId],
    msPublicationGroupId: [this.msTeam.groupId],
    msPublicationChannelId: [this.msTeam.channelId],
    msCompanyFilter: [this.msTeam.companyFilter]
  });
  addMemberOrgForm: UntypedFormGroup = this.formBuilder.group({
    email: ['', Validators.required]
  });
  editMemberRolesForm: UntypedFormGroup = this.formBuilder.group({
    isUserSponsor: [false, Validators.required],
    isUserManager: [false, Validators.required],
    iserUserOwner: [false, Validators.required]
  });
  contentForm: UntypedFormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    value: ['']
  });
  submitting = false;
  submittingEmail = false;
  addStatus = 'idle';
  submitStatus = 'idle';

  // Members card
  private rawResponseMembers: DataPage<UserModel> = new DataPage<UserModel>();
  pagerMembers = new Pager();
  pagedItemsMembers: User[] = [];
  pageSizeMembers = 10;
  refreshMembersStatus = 'idle';

  // Contents card
  private rawResponseContents: DataPage<ContentModel> = new DataPage<ContentModel>();
  pagerContents = new Pager();
  pagedItemsContents: ContentModel[] = [];
  pageSizeContents = 10;
  refreshContentStatus = 'idle';

  // Content modal
  modalRef: BsModalRef = new BsModalRef();
  content: ContentModel = new ContentModel();
  editor: any;

  endPointEdit = '';
  slackEndPoint = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
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
    const endPointEdit = '/organizations/edit/' + id;
    const slackEndPoint = '/organizations/edit/slack/' + id;

    if (this.router.url.startsWith(endPointEdit)
      && !this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlSlackOAuth = location.href.replace(endPointEdit, slackEndPoint);
    }
    if (this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlSlackOAuth = location.href.replace(/\?code.*/, "").replace(/&code.*/, "");
    }
  }

  setMicrosoftRedirectUrl() {
    const currentEndPoint = /\/organizations\/edit\/.*/;
    const finalEndPoint = '/organizations/edit/microsoft';
    this.microsoftRedirectUrl = location.href.replace(currentEndPoint, finalEndPoint);
  }

  ngOnInit() {
    this.route.queryParamMap
      .subscribe((params) => {
        const state = Number(params.get('state'));
        if (state > 0) {
          const msTeam = new MsTeamModel();
          msTeam.organization.id = state;
          msTeam.tenantId = this.configService.get('microsoftTenantId');
          this.msTeamService.create(msTeam)
            .subscribe(() => {
              this.router.navigate(['/organizations/edit/' + state]);
            }, error => {
              console.log(error);
            });
        }
      }
      );
    if (this.id > 0) {
      this.setredirectUrlSlackOAuth(this.id);
      const slackEndPoint = '/organizations/edit/slack/' + this.id;
      if (this.router.url.startsWith(slackEndPoint)) {
        this.code = this.route.snapshot.queryParams['code'];
        this.slackTeamService.create(this.id, this.code, this.redirectUrlSlackOAuth)
          .subscribe(() => {
            this.refreshInformations();
            this.refreshMembers();
            this.refreshContents();
          });
      }
      this.slackClientId = this.configService.get('slackClientId');

      this.microsoftEnabled = (/true/i).test(this.configService.get('microsoftEnabled'));
      if (this.microsoftEnabled) {
        this.microsoftTenantId = this.configService.get('microsoftTenantId');
        this.microsoftClientId = this.configService.get('microsoftClientId');
        this.microsoftState = this.id.toString();
        this.setMicrosoftRedirectUrl();
      }

      this.refreshInformations();
      this.refreshMembers();
      this.refreshContents();
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
    if (!(this.id > 0)) {
      this.organization.members = [];
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser !== null) {
        const user = JSON.parse(currentUser);
        if (user !== null) {
          this.organization.members.push(JSON.parse(currentUser));
        }
      }
    }
  }

  refreshMembers(page = 1) {
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
    this.pagedItemsMembers = User.fromModels(this.rawResponseMembers.content);
    for (let k = 0; k < this.pagedItemsMembers.length; k++) {
      this.pagedItemsMembers[k] = User.fromModel(this.pagedItemsMembers[k]);
      this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.forEach(userOrganizationAuthorityId => {
        const orgAuthorityFound = this.organization.organizationAuthorities.find(authority => authority.id === userOrganizationAuthorityId);
        if (orgAuthorityFound !== undefined) {
          this.pagedItemsMembers[k].userOrganizationAuthorities.push(orgAuthorityFound)
        }
      });
      if (this.pagedItemsMembers[k].userOrganizationAuthorities.length > 0) {
        const sponsorAuthority = this.authorities.get('ROLE_SPONSOR');
        const managerAuthority = this.authorities.get('ROLE_MANAGER');
        const ownerAuthority = this.authorities.get('ROLE_OWNER');
        if (sponsorAuthority !== undefined && managerAuthority !== undefined && ownerAuthority !== undefined) {
          const sponsorAuthorityId = sponsorAuthority.id;
          const managerAuthorityId = managerAuthority.id;
          const ownerAuthorityId = ownerAuthority.id;
          this.pagedItemsMembers[k].isUserSponsor = this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.find(authorityId => sponsorAuthorityId == authorityId) !== undefined
          this.pagedItemsMembers[k].isUserManager = this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.find(authorityId => managerAuthorityId == authorityId) !== undefined
          this.pagedItemsMembers[k].isUserOwner = this.pagedItemsMembers[k].userOrganizationAuthoritiesRef.find(authorityId => ownerAuthorityId == authorityId) !== undefined
        }
      }
    }
  }

  refreshContents(page = 1) {
    if (this.pagerService.canChangePage(this.pagerContents, page)) {
      this.refreshContentStatus = 'running';
      this.organizationService.getContents(this.id, page - 1, this.pageSizeContents)
        .subscribe(contents => {
          this.rawResponseContents = contents;
          this.setContentsPage(page);
          this.refreshContentStatus = 'success';
          setTimeout(() => {
            this.refreshContentStatus = 'idle';
          }, 1000);
        }, error => {
          this.refreshContentStatus = 'error';
          console.error(error);
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
    for (let k = 0; k < this.pagedItemsContents.length; k++) {
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

  openNewContentModal(template: TemplateRef<string>) {
    this.openContentModal(template, new ContentModel());
  }

  openContentModal(template: TemplateRef<string>, content: ContentModel) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-xl' })
    );
    content.workspace = uuidv4();
    this.contentForm.controls['name'].setValue(content.name);
    this.contentForm.controls['value'].setValue(content.value);
    this.content = content;
  }

  onSlackSync() {
    this.slackSyncStatus = 'running';
    if (this.organization.slackTeam.id > 0) {
      this.slackTeamService.sync(this.organization.slackTeam.id)
        .subscribe(
          () => {
            this.slackSyncStatus = 'success';
            this.pagerMembers.currentPage = 0;
            this.refreshMembers();
            setTimeout(() => {
              this.slackSyncStatus = 'idle';
            }, 2000);
          },
          error => {
            this.slackSyncStatus = 'error';
            console.error(error);
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
            this.pagerMembers.currentPage = 0;
            this.refreshInformations();
            setTimeout(() => {
              this.slackDisconnectStatus = 'idle';
            }, 2000);
          },
          error => {
            this.slackDisconnectStatus = 'error';
            console.error(error);
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
            this.pagerMembers.currentPage = 0;
            this.refreshMembers();
            setTimeout(() => {
              this.microsoftSyncStatus = 'idle';
            }, 2000);
          },
          error => {
            this.microsoftSyncStatus = 'error';
            console.error(error);
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
            this.pagerMembers.currentPage = 0;
            this.refreshInformations();
            setTimeout(() => {
              this.msDisconnectStatus = 'idle';
            }, 2000);
          },
          error => {
            this.msDisconnectStatus = 'error';
            console.error(error);
            setTimeout(() => {
              this.msDisconnectStatus = 'idle';
            }, 2000);
          });
    }
  }

  onImageUpload(editor: any) {
    this.editor = editor;
    const toolbar = this.editor.getModule('toolbar');
    toolbar.addHandler('image', () => {
      console.log("Root image handler", this.editor);
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
      input.onchange = async () => {
        const file = input.files?.length ? input.files[0] : null;
  
        console.log('User trying to uplaod this:', file);
  
        console.log("editor", this.editor);
        const range = this.editor.getSelection();
        if(file != null) {
          this.fileService.uploadImage(file, this.fileService.getUploadPath("contents/" + this.content.workspace, true))
          .subscribe({
            next: (data) => {
              this.editor.insertEmbed(range.index, 'image', data.path);
            },
            complete: () => {},
            error: error => {
              console.log(error);
            }
          });
        }
      }
    });
  }

  onSubmitContent() {
    if (this.contentForm.invalid) {
      return;
    }

    const content = new ContentModel();
    content.name = this.contentForm.controls['name'].value;
    content.value = this.contentForm.controls['value'].value;
    content.organization.id = this.organization.id;

    if (this.content.id > 0) {
      content.id = this.content.id;
      this.contentService.update(content)
        .subscribe(
          () => {
            this.modalRef.hide();
            this.refreshContents(this.pagerContents.currentPage);
          },
          error => {
            console.error(error);
          });
    } else {
      this.contentService.create(content)
        .subscribe(
          () => {
            this.modalRef.hide();
            this.refreshContents(this.pagerContents.currentPage);
          },
          error => {
            console.error(error);
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
          const user = User.fromModel(response);
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
                console.error(error);
                this.submitting = false;
                this.addStatus = 'error';
                setTimeout(() => {
                  this.addStatus = 'idle';
                }, 2000);
              }
            );
        },
        error => {
          console.error(error);
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
        this.refreshMembers(this.pagerMembers.currentPage);
      });
  }

  onRemoveContent(content: ContentModel) {
    this.contentService.delete(content.id)
      .subscribe(() => {
        this.refreshContents(this.pagerContents.currentPage);
      });
  }

  grant(userId: number, role: string) {
    const organizationAuthority = this.organization.organizationAuthorities.find(authority => authority.name === role);
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

    const organization = new OrganizationModel();
    organization.name = this.f['name'].value;
    organization.logoUrl = this.f['logoUrl'].value;
    organization.socialName = this.f['socialName'].value;
    if (organization.logoUrl === "") {
      organization.logoUrl = "https://eu.ui-avatars.com/api/?name=" + organization.name;
    }
    if (this.organization.slackTeam && this.organization.slackTeam.id > 0) {
      const slackTeam = new SlackTeamModel();
      slackTeam.teamName = this.organization.slackTeam.teamName;
      slackTeam.teamId = this.organization.slackTeam.teamId;
      slackTeam.publicationChannelId = this.f['slackPublicationChannelId'].value;
      this.slackTeamService.update(slackTeam)
        .subscribe(
          () => {
            this.submitting = false;
            this.submitStatus = 'success';
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          },
          error => {
            console.error(error);
            this.submitting = false;
            this.submitStatus = 'error';
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          });
    }

    if (this.msTeam.id > 0) {
      this.msTeamService.update(this.msTeam)
        .subscribe(
          response => {
            console.debug('MS Team updated : ' + response);
          },
          error => {
            console.error(error);
          }
        )
    }

    if (this.id > 0) {
      organization.id = this.id;
      this.organizationService.update(organization)
        .subscribe(
          response => {
            console.debug('Organization updated : ' + response);
            this.submitting = false;
            this.submitStatus = 'success';
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          },
          error => {
            console.error(error);
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
            console.debug('Organization created : ' + response);
            this.submitting = false;
            this.submitStatus = 'success';
            window.location.href = "/organizations/edit/" + response.id
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          },
          error => {
            console.error(error);
            this.submitting = false;
            this.submitStatus = 'error';
            setTimeout(() => {
              this.submitStatus = 'idle';
            }, 2000);
          });
    }

  }

  onDeleteMedia(file: Media) {
    console.debug(file);
    this.fileService.deleteByUrl(file.url)
      .subscribe(
        response => {
          console.debug('Media deleted : ' + response);
        },
        error => {
          console.error(error);
        });
  }

}
