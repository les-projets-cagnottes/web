import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PagerService, OrganizationService, AuthenticationService, UserService, IdeaService } from 'src/app/_services';
import { IdeaModel } from 'src/app/_models';
import { Organization, User, Idea } from 'src/app/_entities';
import { MainService } from 'src/app/_services/main.service';

@Component({
  selector: 'app-list-ideas',
  templateUrl: './list-ideas.component.html',
  styleUrls: ['./list-ideas.component.css']
})
export class ListIdeasComponent implements OnInit {

  // Datas
  currentOrganization: Organization;
  currentUser: User;
  ideas: Idea[] = [];
  selectedIdea: IdeaModel;
  longDescription: string = "";

  // Paginations
  private pagedIdeas: any;
  pager: any = {};
  pageSize: number = 20;

  // Forms
  form: FormGroup;

  // Statuses
  refreshStatus: string = "idle";
  submitting: boolean = false;

  // Modals
  modal: BsModalRef;

  // Editors
  config = {
    height: '200px'
  }

  constructor(private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private ideaService: IdeaService,
    private organizationService: OrganizationService,
    private userService: UserService) { }

  ngOnInit(): void {
    this.currentOrganization = this.authenticationService.currentOrganizationValue;
    this.currentUser = this.authenticationService.currentUserValue  ;
    this.form = this.formBuilder.group({
      icon: ['', Validators.required],
      shortDescription: ['', Validators.required],
      longDescription: [''],
      hasAnonymousCreator: [false],
      hasLeaderCreator: [false]
    });
    this.refresh();
  }

  refresh(page: number = 1) {
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
    var ids = [];
    this.ideas.forEach(idea => {
      if(idea.submitter.id > 0) {
        ids.push(idea.submitter.id);
      }
    });
    this.userService.getAllByIds(ids)
      .subscribe(response => {
        this.refreshStatus = 'success';
        var users = User.fromModels(response);
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

  openModalCreateIdea(template): void {
    this.selectedIdea = new IdeaModel();
    this.longDescription = "";
    this.form.controls.icon.setValue("far fa-lightbulb");
    this.form.controls.shortDescription.setValue("");
    this.form.controls.hasAnonymousCreator.setValue(false);
    this.form.controls.hasLeaderCreator.setValue(false);
    this.modal = this.modalService.show(template);
  }

  openModalEditIdea(template, idea: IdeaModel): void {
    this.selectedIdea = idea;
    this.longDescription = idea.longDescription;
    this.form.controls.icon.setValue(idea.icon);
    this.form.controls.shortDescription.setValue(idea.shortDescription);
    this.form.controls.hasAnonymousCreator.setValue(idea.hasAnonymousCreator);
    this.form.controls.hasLeaderCreator.setValue(idea.hasLeaderCreator);
    this.modal = this.modalService.show(template);
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
    this.selectedIdea.icon = this.form.controls.icon.value;
    this.selectedIdea.shortDescription = this.form.controls.shortDescription.value;
    this.selectedIdea.longDescription = this.form.controls.longDescription.value;
    this.selectedIdea.hasAnonymousCreator = this.form.controls.hasAnonymousCreator.value;
    this.selectedIdea.hasLeaderCreator = this.form.controls.hasLeaderCreator.value;
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

}
