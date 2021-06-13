import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from 'src/app/_entities';
import { ProjectModel } from 'src/app/_models/project/project.model';
import { AuthenticationService, OrganizationService, PagerService } from 'src/app/_services';

@Component({
  selector: 'app-list-projects',
  templateUrl: './list-projects.component.html',
  styleUrls: ['./list-projects.component.css']
})
export class ListProjectsComponent implements OnInit {

  // Data
  private projects: any;
  private status: any;

  // Refreshing state
  refreshStatus: string = "no-refresh";

  // Pagination
  projectsPager: any = {};
  projectsPaged: ProjectModel[];
  projectsLength: number = 10;

  constructor(
    private route: ActivatedRoute,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService
  ) { }

  ngOnInit() {
    this.status = this.route.snapshot.queryParamMap.get('status');
    this.refresh();
  }

  refresh(page: number = 1): void {
    if (this.pagerService.canChangePage(this.projectsPager, page)) {
      this.organizationService.getProjects(this.authenticationService.currentOrganizationValue.id, page - 1, this.projectsLength, [this.status])
        .subscribe(response => {
          this.projects = response;
          this.setPage(page);
          this.refreshStatus = 'success';
          setTimeout(() => {
            this.refreshStatus = 'no-refresh';
          }, 2000);
        });
    }
  }

  setPage(page: number) {
    this.projectsPager = this.pagerService.getPager(this.projects.totalElements, page, this.projectsLength);
    this.projectsPaged = this.projects.content;
  }

  computeDatePercent(start: Date, deadline: Date) {
    var now = new Date();
    var totalDuration = deadline.getTime() - start.getTime();
    var expiredDuration = now.getTime() - start.getTime();
    return this.computeNumberPercent(expiredDuration, totalDuration);
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "100";
    } else if (max < 0) {
      return "100";
    }
    return 100 * number / max;
  }

}
