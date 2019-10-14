import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/_services/project.service';
import { PagerService } from 'src/app/_services';
import { Project } from 'src/app/_models';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  // Refreshing state
  refreshStatus: string = "no-refresh";

  // Pagination
  private rawResponse: any;
  pager: any = {};
  pagedItems: any[];
  pageSize: number = 10;

  constructor(
    private pagerService: PagerService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh(page: number = 1): void {
    if (this.pagerService.canChangePage(this.pager, page)) {
      this.projectService.getAll(page - 1, this.pageSize)
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

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
    var that = this;
    this.pagedItems.forEach(function (value) {
      value.fundingDeadlinePercent = that.computeDatePercent(new Date(value.createdAt), new Date(value.fundingDeadline)) + "%";
      value.peopleRequiredPercent = that.computeNumberPercent(value.peopleGivingTime.length, value.peopleRequired) + "%";
      value.donationsRequiredPercent = that.computeNumberPercent(value.totalDonations, value.donationsRequired) + "%";
    });
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
