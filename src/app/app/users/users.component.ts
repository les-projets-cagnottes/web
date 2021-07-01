import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { UserModel } from 'src/app/_models';
import { UserService, PagerService } from 'src/app/_services';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  editUserForm: FormGroup;
  closeResult: string;
  userEdited: UserModel;
  submitting: boolean;
  refreshStatus: string = "no-refresh";

  // Modal
  modalRef: BsModalRef;

  // Pagination
  private rawResponse: any;
  pager: any = {};
  pagedItems: any[];
  pageSize: number = 10;

  constructor(
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private userService: UserService,
    private modalService: BsModalService) { }

  ngOnInit() {
    this.editUserForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: [''],
      firstname: [''],
      lastname: [''],
      isActivated: [''],
      avatarUrl: [''],
      color: ['']
    });
    this.userEdited = new UserModel();
    this.refresh();
  }


  refresh(page: number = 1): void {
    if (this.pagerService.canChangePage(this.pager, page)) {
      this.userService.list(page - 1, this.pageSize)
        .subscribe(response => {
          this.rawResponse = response;
          this.setPage(page);
          this.refreshStatus = 'success';
          setTimeout(() => {
            this.refreshStatus = 'no-refresh';
          }, 2000);
        });
    }
  }

  openModalCreateUser(template): void {
    this.userEdited = new UserModel();
    this.f.email.setValue("");
    this.f.firstname.setValue("");
    this.f.lastname.setValue("");
    this.f.avatarUrl.setValue("");
    this.f.color.setValue("");
    this.f.isActivated.setValue(false);
    this.openModal(template);
  }

  openModalEditUser(template, user: UserModel): void {
    this.userEdited = user;
    this.f.email.setValue(user.email);
    this.f.firstname.setValue(user.firstname);
    this.f.lastname.setValue(user.lastname);
    this.f.avatarUrl.setValue(user.avatarUrl);
    this.f.isActivated.setValue(user.enabled);
    this.openModal(template);
  }

  openModal(template): void {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-xl' })
    );
  }

  closeModalEditUser(): void {
    this.modalRef.hide();
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
  }

  get f() { return this.editUserForm.controls; }

  onSubmit() {

    // stop here if form is invalid
    if (this.editUserForm.invalid) {
      return;
    }
    if (this.userEdited.id === undefined && this.f.password.value === '') {
      this.f.password.errors.append('Password is required when creating a user');
      return;
    }

    this.submitting = true;
    this.userEdited.email = this.f.email.value;
    this.userEdited.firstname = this.f.firstname.value;
    this.userEdited.lastname = this.f.lastname.value;
    this.userEdited.avatarUrl = this.f.avatarUrl.value;
    this.userEdited.enabled = this.f.isActivated.value;
    
    if (this.userEdited.id === 0) {
      this.userEdited.password = this.f.password.value;
      this.userService.create(this.userEdited)
        .pipe(first())
        .subscribe(
          () => {
            this.submitting = false;
            this.modalRef.hide();
            this.refresh(this.pager.currentPage);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      if (this.f.password.value !== undefined) {
        this.userEdited.password = this.f.password.value;
      }
      this.userService.update(this.userEdited)
        .pipe(first())
        .subscribe(
          () => {
            this.submitting = false;
            this.modalRef.hide();
            this.refresh(this.pager.currentPage);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    }

  }

}
