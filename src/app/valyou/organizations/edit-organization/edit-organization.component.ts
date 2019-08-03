import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrganizationService } from 'src/app/_services/organization.service';
import { Organization, User } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/_services';

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.css']
})
export class EditOrganizationComponent implements OnInit {

  editOrgForm: FormGroup;
  addMemberOrgForm: FormGroup;
  submitting: boolean;
  submittingEmail: boolean;
  orgEdited: Organization = new Organization();

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private organizationService: OrganizationService
  ) { }

  ngOnInit() {
    this.editOrgForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
    this.addMemberOrgForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
    this.orgEdited.members = [];
    this.orgEdited.members.push(JSON.parse(localStorage.getItem('currentUser')));
  }

  onSubmitEmail() {
    if (this.addMemberOrgForm.invalid) {
      return;
    }
    this.userService.getByEmail(this.addMemberOrgForm.controls.email.value).subscribe(
      response => {
        this.orgEdited.members.push(response as User);
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

    this.orgEdited.name = this.f.name.value;

    this.organizationService.create(this.orgEdited)
      .pipe(first())
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
