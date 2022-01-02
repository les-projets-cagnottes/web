import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { NewsModel, ProjectModel, Role } from 'src/app/_models';
import { AuthenticationService, FileService, NewsService, ProjectService } from 'src/app/_services';

@Component({
  selector: 'app-edit-news',
  templateUrl: './edit-news.component.html',
  styleUrls: ['./edit-news.component.css']
})
export class EditNewsComponent implements OnInit {

  // Data
  id: number = 0;
  idProject: number = 0;
  private news: NewsModel = new NewsModel();
  project: ProjectModel = new ProjectModel();

  // Form
  form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    content: ['', [Validators.required]]
  });
  submitting: boolean = false;

  // Long Description editor config
  contentConfig = {
    height: 600,
    uploadImagePath: ''
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private fileService: FileService,
    private newsService: NewsService,
    private projectService: ProjectService) {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.idProject = params['idProject'];
    });
  }

  ngOnInit(): void {
    if (this.id > 0) {
      this.newsService.getById(this.id)
        .subscribe(response => {
          this.news = response;
          this.idProject = this.news.project.id;
          this.refresh();
        });
    } else {
      this.news.workspace = uuidv4();
      this.refresh();
    }
  }

  refresh() {
    this.contentConfig.uploadImagePath = this.fileService.getUploadPath("news/" + this.news.workspace, true);
    this.form.controls['title'].setValue(this.news.title);
    this.form.controls['content'].setValue(this.news.content);
    if(this.idProject > 0) {
      this.projectService.getById(this.idProject)
        .subscribe(project => {
          this.project = project;
        })
    }
  }

  onSubmit() {

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    var submittedNews = new NewsModel();
    submittedNews.title = this.form.controls['title'].value;
    submittedNews.content = this.form.controls['content'].value;
    submittedNews.organization.id = this.authenticationService.currentOrganizationValue.id;
    submittedNews.project.id = this.project.id;
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

  onDeleteMedia(file: any) {
    this.fileService.deleteByUrl(file.url)
      .subscribe(
        () => {},
        error => {
          console.log(error);
        });
  }
}
