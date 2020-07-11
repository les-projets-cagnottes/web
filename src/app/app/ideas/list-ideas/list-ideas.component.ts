import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PagerService, OrganizationService, AuthenticationService } from 'src/app/_services';
import { IdeaModel } from 'src/app/_models';
import { Organization, User } from 'src/app/_entities';

declare function startSimpleMDE(): any;

@Component({
  selector: 'app-list-ideas',
  templateUrl: './list-ideas.component.html',
  styleUrls: ['./list-ideas.component.css']
})
export class ListIdeasComponent implements OnInit {

  // Datas
  currentOrganization: Organization;
  currentUser: User;
  ideas: IdeaModel[];
  selectedIdea: IdeaModel;

  // Paginations
  private pagedIdeas: any;
  pager: any = {};
  pageSize: number = 10;

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
    private organizationService: OrganizationService) { }

  ngOnInit(): void {
    this.currentOrganization = this.authenticationService.currentOrganizationValue;
    this.currentUser = this.authenticationService.currentUserValue  ;
    this.form = this.formBuilder.group({
      shortDescription: ['', Validators.required],
      longDescription: [''],
      hasAnonymousCreator: [false],
      hasLeaderCreator: [false]
    });
    this.refresh();
  }

  refresh(page: number = 1) {
    if (this.pagerService.canChangePage(this.pager, page)) {
      this.organizationService.getIdeas(this.authenticationService.currentOrganizationValue.id, page - 1, this.pageSize)
        .subscribe(response => {
          this.pagedIdeas = response;
          this.setPage(page);
          this.refreshStatus = 'success';
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
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.pagedIdeas.totalElements, page, this.pageSize);
    this.ideas = this.pagedIdeas.content;
  }

  openModalCreateIdea(template): void {
    this.selectedIdea = new IdeaModel();
    this.form.controls.shortDescription.setValue("");
    this.form.controls.longDescription.setValue("");
    this.form.controls.hasAnonymousCreator.setValue(false);
    this.form.controls.hasLeaderCreator.setValue(false);
    this.modal = this.modalService.show(template);
  }

  openModalEditIdea(template, idea: IdeaModel): void {
    this.selectedIdea = idea;
    this.form.controls.shortDescription.setValue(idea.shortDescription);
    this.form.controls.longDescription.setValue(idea.longDescription);
    this.form.controls.hasAnonymousCreator.setValue(idea.hasAnonymousCreator);
    this.form.controls.hasLeaderCreator.setValue(idea.hasLeaderCreator);
    this.modal = this.modalService.show(template);
  }

  closeModalEditIdea() {
    this.modal.hide();
  }

  onSubmit() {

  }

}
