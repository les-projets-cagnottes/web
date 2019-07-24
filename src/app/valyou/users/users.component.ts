import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/_services';
import { User } from 'src/app/_models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  users: User[];

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getAll(0, this.dtOptions.pageLength)
      .subscribe(users => {
        this.users = users['content'];
        this.dtTrigger.next();
      });
  }
}
