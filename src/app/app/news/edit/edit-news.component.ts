import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { NewsModel, ProjectModel, Role } from 'src/app/_models';
import { AuthenticationService, FileService, NewsService, ProjectService } from 'src/app/_services';
import { Media } from 'src/app/_models/media/media';

@Component({
  selector: 'app-edit-news',
  templateUrl: './edit-news.component.html',
  styleUrls: ['./edit-news.component.css']
})
export class EditNewsComponent implements OnInit {

  // Data
  id = 0;
  idProject = 0;
  private news: NewsModel = new NewsModel();
  project: ProjectModel = new ProjectModel();

  // Form
  form: UntypedFormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    content: ['', [Validators.required]]
  });
  submitting = false;

  // Long Description editor config
  editor: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
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
    this.form.controls['title'].setValue(this.news.title);
    this.form.controls['content'].setValue(this.news.content);
    if(this.idProject > 0) {
      this.projectService.getById(this.idProject)
        .subscribe(project => {
          this.project = project;
        })
    }
  }

  onImageUpload(editor: any) {
    this.editor = editor;
    const toolbar = this.editor.getModule('toolbar');
    toolbar.addHandler('image', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
      input.onchange = async () => {
        const file = input.files?.length ? input.files[0] : null;
        const range = this.editor.getSelection();
        if(file != null) {
          this.fileService.uploadImage(file, this.fileService.getUploadPath("news/" + this.news.workspace, true))
          .subscribe({
            next: (data) => {
              this.editor.insertEmbed(range.index, 'image', data.path);
              this.form.controls['content'].setValue(this.editor.root.innerHTML);
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

  onSubmit() {

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    const submittedNews = new NewsModel();
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
            console.debug('News updated : ' + response);
            this.submitting = false;
            this.router.navigate(['/news/']);
          },
          error => {
            console.error(error);
            this.submitting = false;
          });
    } else {
      this.newsService.create(submittedNews)
        .subscribe(
          response => {
            console.debug('News created : ' + response);
            this.submitting = false;
            this.router.navigate(['/news/']);
          },
          error => {
            console.error(error);
            this.submitting = false;
          });
    }
  }

  get isAdmin() {
    const isAdmin = this.authenticationService.currentUserValue != null && this.authenticationService.currentUserValue.userAuthorities != null;
    return isAdmin && this.authenticationService.currentUserValue.userAuthorities.some(a => a.name === Role.Admin);
  }

  onDeleteMedia(file: Media) {
    this.fileService.deleteByUrl(file.url)
      .subscribe(
        response => {
          console.debug('Media deleted : ' + response)
        },
        error => {
          console.error(error);
        });
  }
}
