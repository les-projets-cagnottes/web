import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/_services';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {

  validateStatus: string = 'idle';

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
  }

  validateProjects() {
    this.validateStatus = 'running';
    this.projectService.validate()
      .subscribe(
        () => {
          this.validateStatus = 'success';
          setTimeout(() => {
            this.validateStatus = 'idle';
          }, 2000);
        },
        error => {
          this.validateStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.validateStatus = 'idle';
          }, 2000);
        });
  }

}
