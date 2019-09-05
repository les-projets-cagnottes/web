import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/_services/project.service';
import { Project, Organization } from 'src/app/_models';
import { AuthenticationService, OrganizationService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';

declare function startSimpleMDE(): any;

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css']
})
export class NewProjectComponent implements OnInit {

  // Data
  private id: number = 0;
  private project: Project = new Project();
  organizations: Organization[];
  minDonations: string = "0.00";

  // Form
  form: FormGroup = this.formBuilder.group({
    organizations: [0],
    title: ['', Validators.required],
    shortDescription: ['', Validators.required],
    fundingDeadline: [''],
    donationsRequired: [0, Validators.required],
    peopleRequired: [2, Validators.required]
  });
  submitting: boolean;

  // Funding Deadline field
  now: Date = new Date();
  nowPlus3Months = new Date();
  fundingDeadlineValue = new Date();

  // Long description field
  private simplemde;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService
  ) {
    this.route.params.subscribe(params => this.id = params.id);
  }

  ngOnInit() {
    if (this.id > 0) {
      this.projectService.getById(this.id)
        .subscribe(response => {
          this.project = response;
          this.refresh();
        });
    } else {
      this.refresh();
    }
  }

  refresh() {
    this.form.controls['organizations'].setValue(0);
    this.form.controls['title'].setValue(this.project.title);
    this.form.controls['shortDescription'].setValue(this.project.shortDescription);
    this.form.controls['fundingDeadline'].setValue(this.dateToString(this.project.fundingDeadline));
    this.form.controls['donationsRequired'].setValue(this.project.donationsRequired);
    this.form.controls['peopleRequired'].setValue(this.project.peopleRequired);

    if(this.id > 0) {
      this.form.controls['fundingDeadline'].disable();
      this.form.controls['donationsRequired'].setValidators([Validators.required, Validators.min(this.project.donationsRequired)]);
      this.minDonations = this.project.donationsRequired.toString();
    }

    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    if(typeof startSimpleMDE === 'function') {
      this.simplemde = startSimpleMDE();
      this.simplemde.value(this.project.longDescription);
      this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
        .subscribe(orgs => {
          this.organizations = orgs;
        })
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    // Get data from form
    var selectedOrg = new Organization();
    selectedOrg.id = this.organizations[this.f.organizations.value].id;
    this.project.organizations = [selectedOrg];
    this.project.title = this.f.title.value;
    this.project.shortDescription = this.f.shortDescription.value;
    this.project.donationsRequired = this.f.donationsRequired.value;
    this.project.peopleRequired = this.f.peopleRequired.value;
    this.project.longDescription = this.simplemde.value();
    this.project.leader.id = this.authenticationService.currentUserValue.id;

    // Submit item to backend
    if(this.id > 0) {
      this.project.donations = [];
      this.projectService.update(this.project)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/projects/' + response.id]);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      this.project.fundingDeadline = this.fundingDeadlineValue;
      this.projectService.create(this.project)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/projects/' + response.id]);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    }

  }

  dateToString(date: Date) {
    var date = new Date(date);
    return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
  }

}
