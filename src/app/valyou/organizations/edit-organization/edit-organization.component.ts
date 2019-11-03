import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrganizationService } from 'src/app/_services/organization.service';
import { Organization, User, Content } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UserService, PagerService } from 'src/app/_services';
import { Router, ActivatedRoute } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { ContentService } from 'src/app/_services/content.service';

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
    name: [this.organization.name, Validators.required],
    slackTeamId: [this.organization.slackTeamId]
  });;
  addMemberOrgForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required]
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
  slackClientId: string;
  redirectUrlOAuth: string;
  code: string;

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
    var endPointEdit = '/organizations/edit/' + this.id;
    var slackEndPoint = '/organizations/edit/slack/' + this.id
    if (this.router.url.startsWith(endPointEdit)
      && !this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlOAuth = location.href.replace(endPointEdit, slackEndPoint);
    }
    if(this.router.url.startsWith(slackEndPoint)) {
      this.redirectUrlOAuth = location.href.replace(/\?code.*/, "").replace(/&code.*/, "");
      this.code = this.route.snapshot.queryParams['code'];
      console.log(this.code);
      // API Call here to validate code
    }
    this.slackClientId = environment.slackClientId;
  }

  ngOnInit() {
    if (this.id > 0) {
      this.organizationService.getById(this.id)
        .subscribe(
          organization => {
            this.organization = organization;
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

  refreshForm() {
    this.editOrgForm.controls.name.setValue(this.organization.name);
    this.editOrgForm.controls.slackTeamId.setValue(this.organization.slackTeamId);
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
      this.pagedItemsMembers[k] = new User().decode(this.pagedItemsMembers[k]);
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
          var user = new User().decode(response);
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

  get f() { return this.editOrgForm.controls; }

  onSubmit() {

    // stop here if form is invalid
    if (this.editOrgForm.invalid) {
      return;
    }

    var organization2save = new Organization();
    organization2save.name = this.f.name.value;
    organization2save.slackTeamId = this.f.slackTeamId.value;
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
    }

  }

}
