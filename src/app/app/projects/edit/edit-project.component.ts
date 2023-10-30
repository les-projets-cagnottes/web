import { Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Project } from 'src/app/_entities';
import { ProjectModel } from 'src/app/_models/project/project.model';
import { ProjectStatus } from 'src/app/_models/project/project-status';
import { Media } from 'src/app/_models/media/media';
import { AuthenticationService, FileService, ProjectService } from 'src/app/_services';

import 'quill-emoji/dist/quill-emoji.js'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {

  projectStatus = ProjectStatus;
  
  // Data
  id = 0;
  project: Project = new Project();

  // Form
  form: UntypedFormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(255)]],
    longDescription: ['', [Validators.required]],
    peopleRequired: [2, [Validators.required, Validators.min(2)]]
  });
  submitting = false;

  // Long Description editor config
  editor: any;
  
  // Publish Idea Modal
  publishIdeaModal = new BsModalRef();
  publishIdeaForm: UntypedFormGroup = this.formBuilder.group({
    ideaHasAnonymousCreator: [false],
    ideaHasLeaderCreator: [false]
  });

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private fileService: FileService,
    private projectService: ProjectService) {
    this.route.params.subscribe(params => this.id = params['id']);
    if (this.id == undefined) {
      this.id = 0;
    }
  }

  ngOnInit(): void {
    if (this.id > 0) {
      this.projectService.getById(this.id)
        .subscribe(response => {
          this.project = Project.fromModel(response);
          this.refresh();
        });
    } else {
      this.project.workspace = uuidv4();
      this.project.longDescription = "<h1>De quoi s'agit-il ?</h1>\n<h1>Qui est concerné ?</h1><h1>A quoi va servir le budget ?<br></h1>\n<h1>Pourquoi ça me tient à cœur</h1><p><br></p><p><br></p>\n"
      this.refresh();
    }
  }

  refresh() {
    this.form.controls['title'].setValue(this.project.title);
    this.form.controls['shortDescription'].setValue(this.project.shortDescription);
    this.form.controls['longDescription'].setValue(this.project.longDescription);
    this.form.controls['peopleRequired'].setValue(this.project.peopleRequired);
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
        if (file != null) {
          this.fileService.uploadImage(file, this.fileService.getUploadPath("projects/" + this.project.workspace, true))
            .subscribe({
              next: (data) => {
                this.editor.insertEmbed(range.index, 'image', data.path);
                this.form.controls['longDescription'].setValue(this.editor.root.innerHTML);
              },
              complete: () => { },
              error: error => {
                console.log(error);
              }
            });
        }
      }
    });
  }

  onSubmit(status?: ProjectStatus ) {

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    const submittedProject = new ProjectModel();
    submittedProject.title = this.form.controls['title'].value;
    submittedProject.shortDescription = this.form.controls['shortDescription'].value;
    submittedProject.longDescription = this.form.controls['longDescription'].value;
    submittedProject.peopleRequired = this.form.controls['peopleRequired'].value;
    submittedProject.workspace = this.project.workspace;
    submittedProject.organization.id = this.authenticationService.currentOrganizationValue.id;

    // In case of publishing as an IDEA
    if(status === this.projectStatus.IDEA) {
      submittedProject.ideaHasAnonymousCreator = this.publishIdeaForm.controls['ideaHasAnonymousCreator'].value;
      submittedProject.ideaHasLeaderCreator = this.publishIdeaForm.controls['ideaHasLeaderCreator'].value;
    } else {
      submittedProject.ideaHasAnonymousCreator = this.project.ideaHasAnonymousCreator;
      submittedProject.ideaHasLeaderCreator = this.project.ideaHasLeaderCreator;
    }

    if(status !== undefined) {
      submittedProject.status = status;
    } else {
      submittedProject.status = this.project.status;
    }

    // Submit item to backend
    if (this.id > 0) {
      submittedProject.id = this.id;
      submittedProject.leader.id = this.project.leader.id;
      this.projectService.update(submittedProject)
        .subscribe({
          next: (response) => {
            this.submitting = false;
            this.publishIdeaModal.hide();
            this.router.navigate(['/projects/' + response.id]);
          },
          complete: () => { },
          error: error => {
            console.error(error);
            this.submitting = false;
          }
        });
    } else {
      submittedProject.leader.id = this.authenticationService.currentUserValue.id;
      this.projectService.create(submittedProject)
        .subscribe({
          next: (response) => {
            this.submitting = false;
            this.publishIdeaModal.hide();
            this.router.navigate(['/projects/' + response.id]);
          },
          complete: () => { },
          error: error => {
            console.error(error);
            this.submitting = false;
          }
        });
    }
  }

  onDeleteMedia(file: Media) {
    this.fileService.deleteByUrl(file.url)
      .subscribe({
        next: (response) => {
          console.debug('Media deleted : ' + response);
        },
        complete: () => { },
        error: error => {
          console.error(error);
        }
      });
  }

  openPublishIdeaModal(template: TemplateRef<string>) {
    this.publishIdeaModal = this.modalService.show(template);
  }
}
