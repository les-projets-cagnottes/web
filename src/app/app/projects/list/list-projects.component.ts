import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataPage } from 'src/app/_models';
import { Pager } from 'src/app/_models/pagination/pager/pager';
import { ProjectModel } from 'src/app/_models/project/project.model';
import { AuthenticationService, OrganizationService, PagerService } from 'src/app/_services';

@Component({
  selector: 'app-list-projects',
  templateUrl: './list-projects.component.html',
  styleUrls: ['./list-projects.component.css']
})
export class ListProjectsComponent implements OnInit {

  // Data
  private projects = new DataPage<ProjectModel>();
  private status = 'in_progress';

  // Refreshing state
  refreshStatus = "no-refresh";

  // Pagination
  projectsPager = new Pager();
  projectsPaged: ProjectModel[] = [];
  projectsLength = 10;

  constructor(
    private route: ActivatedRoute,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService
  ) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.status = params.get('status') || 'in_progress';
      this.refresh();
    });
  }

  refresh(page = 1): void {
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

}
