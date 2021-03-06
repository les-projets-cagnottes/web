import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Organization, Project } from 'src/app/_entities';
import { ProjectModel } from 'src/app/_models/project/project.model';
import { AuthenticationService, ProjectService, UserService } from 'src/app/_services';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {

  // Data
  id: number = 0;
  private project: Project = new Project();
  organizations: Organization[] = [];

  // Form
  form: FormGroup = this.formBuilder.group({
    organization: [0],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(255)]],
    longDescription: ['', [Validators.required]],
    peopleRequired: [2, [Validators.required, Validators.min(2)]]
  });
  submitting: boolean;

  // Funding Deadline field
  now: Date = new Date();
  nowPlus3Months = new Date();
  fundingDeadlineValue = new Date();
  // Long Description editor config
  longDescriptionConfig = {
    height: '600px',
    uploadImagePath: 'http://localhost:8080/api/files/image'
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private projectService: ProjectService,
    private userService: UserService) {
    this.route.params.subscribe(params => this.id = params.id);
  }

  ngOnInit(): void {
    if (this.id > 0) {
      this.projectService.getById(this.id)
        .subscribe(response => {
          this.project = Project.fromModel(response);
          this.refresh();
        });
    } else {
      this.project.longDescription = "<blockquote><h1>Ceci est un modèle par défaut. N'hésitez pas à l'embellir pour montrer votre projet sous son meilleur jour ;-)<br></h1></blockquote><h1>Mon super projet</h1>\n<h2>De quoi s'agit-il ?</h2>\n<h2>Qui est concerné ?</h2><h2>A quoi va servir le budget ?<br></h2>\n<h2>Pourquoi ça me tient à cœur</h2><p><br></p><p><br></p>\n"
      this.refresh();
    }
  }

  refresh() {
    this.form.controls['organization'].setValue(0);
    this.form.controls['title'].setValue(this.project.title);
    this.form.controls['shortDescription'].setValue(this.project.shortDescription);
    this.form.controls['longDescription'].setValue(this.project.longDescription);
    this.form.controls['peopleRequired'].setValue(this.project.peopleRequired);

    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.userService.getOrganizations(this.authenticationService.currentUserValue.id)
      .subscribe(orgs => {
        orgs.forEach(org => this.organizations.push(Organization.fromModel(org)));
        this.form.controls['organization'].setValue(0);
      });
  }

  onSubmit() {

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    var submittedProject = new ProjectModel();
    submittedProject.title = this.form.controls.title.value;
    submittedProject.shortDescription = this.form.controls.shortDescription.value;
    submittedProject.longDescription = this.form.controls.longDescription.value;
    submittedProject.peopleRequired = this.form.controls.peopleRequired.value;
    submittedProject.organizationsRef = [this.organizations[this.form.controls.organization.value].id];

    // Submit item to backend
    if (this.id > 0) {
      submittedProject.id = this.id;
      submittedProject.leader.id = this.project.leader.id;
      this.projectService.update(submittedProject)
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
      submittedProject.leader.id = this.authenticationService.currentUserValue.id;
      this.projectService.create(submittedProject)
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
}
