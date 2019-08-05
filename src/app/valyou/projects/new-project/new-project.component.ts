import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/_services/project.service';
import { Project } from 'src/app/_models';
import { AuthenticationService } from 'src/app/_services';

declare function startSimpleMDE(): any;

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css']
})
export class NewProjectComponent implements OnInit {

  private form: FormGroup;
  private submitting: boolean;

  // Funding Deadline field
  private now: Date = new Date();
  private nowPlus3Months = new Date();
  private fundingDeadlineValue = new Date();

  // Long description field
  private simplemde;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      shortDescription: ['', Validators.required],
      fundingDeadline: [''],
      donationsRequired: ['0.00', Validators.required],
      peopleRequired: ['3', Validators.required]
    });
    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    this.simplemde = startSimpleMDE();
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
    var project = new Project();
    project.title = this.f.title.value;
    project.shortDescription = this.f.shortDescription.value;
    project.donationsRequired = this.f.donationsRequired.value;
    project.peopleRequired = this.f.peopleRequired.value;
    project.longDescription = this.simplemde.value();
    project.leader = this.authenticationService.currentUserValue;
    project.fundingDeadline = this.fundingDeadlineValue;

    // Submit item to backend
    this.projectService.create(project)
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
