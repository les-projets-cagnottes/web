import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/_services';
import { User } from 'src/app/_models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  editUserForm: FormGroup;
  closeResult: string;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  users: User[];
  userEdited: User;
  editUserModalLabel: string;
  submitting: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService) { }

  ngOnInit() {
    this.editUserForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      firstname: [''],
      lastname: [''],
      isActivated: [''],
      avatarUrl: [''],
      color: ['']
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.userEdited = new User();
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getAll(0, this.dtOptions.pageLength)
      .subscribe(users => {
        this.users = users['content'];
        this.dtTrigger.next();
      });
  }

  refresh(): void {
    this.userService.getAll(0, this.dtOptions.pageLength)
      .subscribe(users => {
        this.users = users['content'];
      });
  }

  openModalCreateUser(): void {
    this.editUserModalLabel = "New User";
  }

  get f() { return this.editUserForm.controls; }

  onSubmit() {

    console.log("riezop")
    // stop here if form is invalid
    if (this.editUserForm.invalid) {
      return;
    }
    this.submitting = true;
    this.userEdited = new User();
    this.userEdited.email = this.f.email.value;
    this.userEdited.password = this.f.password.value;
    this.userEdited.firstname = this.f.firstname.value;
    this.userEdited.lastname = this.f.lastname.value;
    this.userEdited.avatarUrl = this.f.avatarUrl.value;
    this.userEdited.color = this.f.color.value;
    this.userEdited.isActivated = this.f.isActivated.value;

    this.userService.create(this.userEdited)
      .pipe(first())
      .subscribe(
        data => {
          this.refresh();
          this.submitting = false;
        },
        error => {
          console.log(error);
          this.submitting = false;
        });
  }

}
