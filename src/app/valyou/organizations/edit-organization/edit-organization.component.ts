import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrganizationService } from 'src/app/_services/organization.service';
import { Organization, User } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/_services';
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

  editOrgForm: FormGroup;
  addMemberOrgForm: FormGroup;
  submitting: boolean;
  submittingEmail: boolean;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
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
      name: [this.organization.name, Validators.required]
    });
    this.addMemberOrgForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
    if (!(this.id > 0)) {
      this.organization.members = [];
      this.organization.members.push(JSON.parse(localStorage.getItem('currentUser')));
    }
  }

  onSubmitEmail() {
    if (this.addMemberOrgForm.invalid) {
      return;
    }
    this.userService.getByEmail(this.addMemberOrgForm.controls.email.value)
      .subscribe(
        response => {
          var user = new User();
          user.id = response.id;
          user.firstname = response.firstname;
          user.lastname = response.lastname;
          user.email = response.email;
          this.organization.members.push(response as User);
        },
        error => {
          console.log(error);
          this.submitting = false;
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
    organization2save.members = this.organization.members;

    if (this.id > 0) {
      organization2save.id = this.id;
      this.organizationService.update(organization2save)
        .subscribe(
          () => {
            this.submitting = false;
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      this.organizationService.create(organization2save)
        .subscribe(
          () => {
            this.submitting = false;
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    }

  }

}
