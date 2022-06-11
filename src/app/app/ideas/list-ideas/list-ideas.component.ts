import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { v4 as uuidv4 } from 'uuid';
import { PagerService, OrganizationService, AuthenticationService, UserService, IdeaService, FileService } from 'src/app/_services';
import { DataPage, IdeaModel } from 'src/app/_models';
import { Organization, User, Idea } from 'src/app/_entities';
import { Media } from 'src/app/_models/media/media';
import { Pager } from 'src/app/_models/pagination/pager/pager';

@Component({
  selector: 'app-list-ideas',
  templateUrl: './list-ideas.component.html',
  styleUrls: ['./list-ideas.component.css']
})
export class ListIdeasComponent implements OnInit {

  // Datas
  currentOrganization: Organization = this.authenticationService.currentOrganizationValue;
  currentUser: User = this.authenticationService.currentUserValue;
  ideas: Idea[] = [];
  selectedIdea: IdeaModel = new IdeaModel();
  longDescription = "";

  // Paginations
  private pagedIdeas: DataPage<IdeaModel> = new DataPage<IdeaModel>();
  pager = new Pager();
  pageSize = 20;

  // Forms
  form: FormGroup = this.formBuilder.group({
    icon: ['', Validators.required],
    shortDescription: ['', Validators.required],
    longDescription: [''],
    hasAnonymousCreator: [false],
    hasLeaderCreator: [false]
  });

  // Statuses
  refreshStatus = "idle";
  submitting = false;

  // Modals
  modal: BsModalRef = new BsModalRef();

  // Editors
  config = {
    height: 200,
    uploadImagePath: ''
  }
  
  constructor(private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private fileService: FileService,
    private ideaService: IdeaService,
    private organizationService: OrganizationService,
    private userService: UserService) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(page = 1) {
    if (this.pagerService.canChangePage(this.pager, page)) {
      this.ideas = [];
      this.organizationService.getIdeas(this.authenticationService.currentOrganizationValue.id, page - 1, this.pageSize)
        .subscribe(response => {
          this.pagedIdeas = response;
          this.setPage(page);
        },
        error => {
          console.log(error);
        });
    }
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.pagedIdeas.totalElements, page, this.pageSize);
    this.pagedIdeas.content.forEach(model => this.ideas.push(Idea.fromModel(model)));
    const ids: number[] = [];
    this.ideas.forEach(idea => {
      if(idea.submitter.id > 0) {
        ids.push(idea.submitter.id);
      }
    });
    this.userService.getAllByIds(ids)
      .subscribe(response => {
        this.refreshStatus = 'success';
        const users = User.fromModels(response);
        this.ideas.forEach(idea => idea.setSubmitter(users));
        setTimeout(() => {
          this.refreshStatus = 'idle';
        }, 2000);
      },
      error => {
        this.refreshStatus = 'error';
        console.log(error);
        setTimeout(() => {
          this.refreshStatus = 'idle';
        }, 2000);
      });
  }

  openModalCreateIdea(template: TemplateRef<string>): void {
    this.selectedIdea = new IdeaModel();
    this.longDescription = "";
    this.selectedIdea.workspace = uuidv4();
    this.config.uploadImagePath = this.fileService.getUploadPath("ideas/" + this.selectedIdea.workspace, true);
    this.form.controls['icon'].setValue("far fa-lightbulb");
    this.form.controls['shortDescription'].setValue("");
    this.form.controls['longDescription'].setValue("");
    this.form.controls['hasAnonymousCreator'].setValue(false);
    this.form.controls['hasLeaderCreator'].setValue(false);
    this.modal = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-xl' })
    );
  }

  openModalEditIdea(template: TemplateRef<string>, idea: IdeaModel): void {
    this.selectedIdea = idea;
    this.longDescription = idea.longDescription;
    this.config.uploadImagePath = this.fileService.getUploadPath("ideas/" + this.selectedIdea.workspace, true);
    this.form.controls['icon'].setValue(idea.icon);
    this.form.controls['shortDescription'].setValue(idea.shortDescription);
    this.form.controls['longDescription'].setValue(idea.longDescription);
    this.form.controls['hasAnonymousCreator'].setValue(idea.hasAnonymousCreator);
    this.form.controls['hasLeaderCreator'].setValue(idea.hasLeaderCreator);
    this.modal = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-xl' })
    );
  }

  closeModalEditIdea() {
    this.modal.hide();
  }

  onSubmit() {

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.selectedIdea.icon = this.form.controls['icon'].value;
    this.selectedIdea.shortDescription = this.form.controls['shortDescription'].value;
    this.selectedIdea.longDescription = this.form.controls['longDescription'].value;
    this.selectedIdea.hasAnonymousCreator = this.form.controls['hasAnonymousCreator'].value;
    this.selectedIdea.hasLeaderCreator = this.form.controls['hasLeaderCreator'].value;
    this.selectedIdea.organization.id = this.currentOrganization.id;
    
    if (this.selectedIdea.id <= 0) {
      this.ideaService.create(this.selectedIdea)
        .subscribe(
          () => {
            this.submitting = false;
            this.modal.hide();
            this.refresh(this.pager.currentPage);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      this.ideaService.update(this.selectedIdea)
        .subscribe(
          () => {
            this.submitting = false;
            this.modal.hide();
            this.refresh(this.pager.currentPage);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    }
  }

  onDeleteMedia(file: Media) {
    this.fileService.deleteByUrl(file.url)
      .subscribe(
        response => {
          console.debug('Media deleted : ' + response);
        },
        error => {
          console.log(error);
        });
  }
}
