import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrganizationService } from 'src/app/_services/organization.service';
import { Organization, User } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { UserService, PagerService } from 'src/app/_services';
import { ActivatedRoute } from '@angular/router';

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
  editOrgForm: FormGroup;
  addMemberOrgForm: FormGroup;
  submitting: boolean;
  submittingEmail: boolean;
  addStatus: string = 'idle';
  submitStatus: string = 'idle';

  // Pagination
  private rawResponse: any;
  pager: any = {};
  pagedItems: any[];
  pageSize: number = 10;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {
    this.route.params.subscribe(params => this.id = <number>params.id);
  }

  ngOnInit() {
    if (this.id > 0) {
      this.organizationService.getById(this.id)
        .subscribe(
          organization => {
            this.organization = organization;
            this.refreshForm();
            this.refreshMembers();
          },
          error => {
            console.log(error);
          });
    } else {
      this.refreshForm();
    }
  }

  refreshForm() {
    this.editOrgForm = this.formBuilder.group({
      name: [this.organization.name, Validators.required],
      slackTeamId: [this.organization.slackTeamId]
    });
    this.addMemberOrgForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
    if (!(this.id > 0)) {
      this.organization.members = [];
      var user = JSON.parse(localStorage.getItem('currentUser'));
      if (user !== null) {
        this.organization.members.push(JSON.parse(localStorage.getItem('currentUser')));
      }
    }
  }

  refreshMembers(page: number = 1) {
    this.organizationService.getMembers(this.organization.id, page - 1, this.pageSize)
      .subscribe(response => {
        this.rawResponse = response;
        this.setPage(page);
      });
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
    for (var k = 0; k < this.pagedItems.length; k++) {
      this.pagedItems[k] = new User().decode(this.pagedItems[k]);
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
                this.refreshMembers(this.pager.page);
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
        this.refreshMembers(this.pager.page);
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
