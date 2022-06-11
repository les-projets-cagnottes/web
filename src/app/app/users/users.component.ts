import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthorityModel, DataPage, UserModel } from 'src/app/_models';
import { UserService, PagerService, AuthorityService } from 'src/app/_services';
import { Pager } from 'src/app/_models/pagination/pager/pager';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  editUserForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required],
    password: [''],
    firstname: [''],
    lastname: [''],
    isActivated: [''],
    avatarUrl: [''],
    color: ['']
  });;
  closeResult = '';
  userEdited: UserModel = new UserModel();
  submitting = false;
  refreshStatus = "no-refresh";
  adminAuthority: AuthorityModel = new AuthorityModel();

  // Modal
  modalRef: BsModalRef = new BsModalRef();

  // Pagination
  private rawResponse = new DataPage<UserModel>();
  pager = new Pager();
  pagedItems: UserModel[] = [];
  pageSize = 10;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private authorityService: AuthorityService,
    private userService: UserService) {
  }

  ngOnInit() {
    this.refreshAuthorities();
    this.refresh();
  }

  refreshAuthorities() {
    this.authorityService.list()
      .subscribe(response => {
          const authority = response.find(element => element.name == 'ROLE_ADMIN');
          this.adminAuthority = authority != null ? authority : new AuthorityModel();
      });
  }

  refresh(page = 1): void {
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

  openModalCreateUser(template: TemplateRef<string>): void {
    this.userEdited = new UserModel();
    this.f['email'].setValue("");
    this.f['firstname'].setValue("");
    this.f['lastname'].setValue("");
    this.f['avatarUrl'].setValue("");
    this.f['color'].setValue("");
    this.f['isActivated'].setValue(false);
    this.openModal(template);
  }

  openModalEditUser(template: TemplateRef<string>, user: UserModel): void {
    this.userEdited = user;
    this.f['email'].setValue(user.email);
    this.f['firstname'].setValue(user.firstname);
    this.f['lastname'].setValue(user.lastname);
    this.f['avatarUrl'].setValue(user.avatarUrl);
    this.f['isActivated'].setValue(user.enabled);
    this.openModal(template);
  }

  openModal(template: TemplateRef<string>): void {
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
    if (this.userEdited.id === undefined && this.f['password'].value === '') {
      return;
    }

    this.submitting = true;
    this.userEdited.email = this.f['email'].value;
    this.userEdited.firstname = this.f['firstname'].value;
    this.userEdited.lastname = this.f['lastname'].value;
    this.userEdited.avatarUrl = this.f['avatarUrl'].value;
    this.userEdited.enabled = this.f['isActivated'].value;

    if (this.userEdited.id === 0) {
      this.userEdited.password = this.f['password'].value;
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
      if (this.f['password'].value !== undefined) {
        this.userEdited.password = this.f['password'].value;
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

  isAdmin(user: UserModel) {
    const userAdminAuthority = user.userAuthoritiesRef.find(element => element == this.adminAuthority.id);
    return userAdminAuthority != null;
  }

  grant(userId: number) {
    if (this.adminAuthority !== undefined) {
      this.userService.grant(userId, this.adminAuthority)
        .subscribe(() => {
          this.refresh(this.pager.currentPage);
        });
    }
  }

}
