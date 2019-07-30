import { Component, OnInit } from '@angular/core';
import { UserService, PagerService } from 'src/app/_services';
import { User } from 'src/app/_models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  editUserForm: FormGroup;
  closeResult: string;
  userEdited: User;
  editUserModalLabel: string;
  submitting: boolean;
  refreshStatus: string = "no-refresh";

  private rawResponse: any;
  pager: any = {};
  pagedItems: any[];
  pageSize: number = 10;

  constructor(
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private userService: UserService) { }

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
    this.userEdited = new User();
    this.refresh();
  }

  
  refresh(page: number = 1): void {
    this.userService.getAll(page - 1, this.pageSize)
      .subscribe(response => {
        this.rawResponse = response;
        this.setPage(page);
        this.refreshStatus = 'success';
        setTimeout(() => {
          this.refreshStatus = 'no-refresh';
        }, 2000);
      });
  }

  openModalCreateUser(): void {
    this.userEdited = new User();
    this.editUserModalLabel = "New User";
    this.f.email.setValue("");
    this.f.firstname.setValue("");
    this.f.lastname.setValue("");
    this.f.avatarUrl.setValue("");
    this.f.color.setValue("");
    this.f.isActivated.setValue(false);
  }

  openModalEditUser(user: User): void {
    this.editUserModalLabel = user.firstname + " " + user.lastname;
    this.userEdited = user;
    this.f.email.setValue(user.email);
    this.f.firstname.setValue(user.firstname);
    this.f.lastname.setValue(user.lastname);
    this.f.avatarUrl.setValue(user.avatarUrl);
    this.f.color.setValue("#" + user.color);
    this.f.isActivated.setValue(user.isActivated);
  }

  delete(user: User): void {
    this.userService.delete(user.id)
      .subscribe(
        () => {
          this.refresh();
          this.submitting = false;
        },
        error => {
          console.log(error);
          this.submitting = false;
        });
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
    if(this.userEdited.id === undefined && this.f.password.value === '') {
      this.f.password.errors.append('Password is required when creating a user');
      return;
    }

    this.submitting = true;
    this.userEdited.email = this.f.email.value;
    this.userEdited.firstname = this.f.firstname.value;
    this.userEdited.lastname = this.f.lastname.value;
    this.userEdited.avatarUrl = this.f.avatarUrl.value;
    this.userEdited.color = this.f.color.value.substring(1);
    this.userEdited.isActivated = this.f.isActivated.value;

    if (this.userEdited.id === undefined) {
      this.userService.create(this.userEdited)
        .pipe(first())
        .subscribe(
          () => {
            this.refresh();
            this.submitting = false;
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      this.userService.update(this.userEdited)
        .pipe(first())
        .subscribe(
          () => {
            this.refresh();
            this.submitting = false;
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    }

  }

}
