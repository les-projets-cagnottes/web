import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { News, Organization, Project } from 'src/app/_entities';
import { NewsModel, Role } from 'src/app/_models';
import { AuthenticationService, NewsService, ProjectService, UserService } from 'src/app/_services';

@Component({
  selector: 'app-edit-news',
  templateUrl: './edit-news.component.html',
  styleUrls: ['./edit-news.component.css']
})
export class EditNewsComponent implements OnInit {

  // Data
  id: number = 0;
  private news: News = new News();
  organizations: Organization[] = [];
  projects: Project[] = [];

  // Form
  form: FormGroup = this.formBuilder.group({
    organization: [0],
    project: [0],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    content: ['', [Validators.required]]
  });
  submitting: boolean;

  // Long Description editor config
  contentConfig = {
    height: '600px',
    uploadImagePath: 'http://localhost:8080/api/files/image'
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private newsService: NewsService,
    private userService: UserService) {
    this.route.params.subscribe(params => this.id = params.id);
  }

  ngOnInit(): void {
    var organizationNewsFakeProject = new Project();
    organizationNewsFakeProject.title = '---';
    this.projects.push(organizationNewsFakeProject);
    if(this.isAdmin) {
      var systemNewsFakeOrg = new Organization();
      systemNewsFakeOrg.name = '---';
      this.organizations.push(systemNewsFakeOrg);
    }
    if (this.id > 0) {
      this.newsService.getById(this.id)
        .subscribe(response => {
          this.news = News.fromModel(response);
          this.refresh();
        });
        this.form.controls['organization'].disable();
        this.form.controls['project'].disable();
    } else {
      this.refresh();
    }
  }

  refresh() {
    this.form.controls['organization'].setValue(0);
    this.form.controls['project'].setValue(0);
    this.form.controls['title'].setValue(this.news.title);
    this.form.controls['content'].setValue(this.news.content);
    this.userService.getOrganizations(this.authenticationService.currentUserValue.id)
      .subscribe(orgs => {
        orgs.forEach(org => this.organizations.push(Organization.fromModel(org)));
        if(this.news.organization.id > 0) {
          this.form.controls['organization'].setValue(this.organizations.findIndex(org => org.id === this.news.organization.id));
        } else {
          this.form.controls['organization'].setValue(0);
        }
      });
    this.userService.getProjects(this.authenticationService.currentUserValue.id)
      .subscribe(prjs => {
        prjs.forEach(prj => this.projects.push(Project.fromModel(prj)));
        if(this.news.project.id > 0) {
          this.form.controls['project'].setValue(this.projects.findIndex(prj => prj.id === this.news.project.id));
          this.form.controls['project'].disable();
        } else {
          this.form.controls['project'].setValue(0);
        }
      });
  }

  onSubmit() {

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    var submittedNews = new NewsModel();
    submittedNews.title = this.form.controls.title.value;
    submittedNews.content = this.form.controls.content.value;
    submittedNews.organization.id = this.organizations[this.form.controls.organization.value].id;
    submittedNews.project.id = this.projects[this.form.controls.project.value].id;
    submittedNews.type = 'ARTICLE';

    // Submit item to backend
    if (this.id > 0) {
      submittedNews.id = this.id;
      this.newsService.update(submittedNews)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/news/']);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      this.newsService.create(submittedNews)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/news/']);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    }
  }

  get isAdmin() {
    var isAdmin = this.authenticationService.currentUserValue != null && this.authenticationService.currentUserValue.userAuthorities != null;
    return isAdmin && this.authenticationService.currentUserValue.userAuthorities.some(a => a.name === Role.Admin);
  }
}
