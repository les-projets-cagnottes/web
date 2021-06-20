import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/_entities';
import { NewsModel } from 'src/app/_models';
import { AuthenticationService, NewsService, OrganizationService, PagerService, ProjectService, UserService } from 'src/app/_services';

@Component({
  selector: 'app-news',
  templateUrl: './list-news.component.html',
  styleUrls: ['./list-news.component.css']
})
export class ListNewsComponent implements OnInit {

  // Data
  private news: any;
  userLoggedIn: User = new User();
  data: any = {};
  projects: any = {};
  dates: string[] = [];

  // Refreshing state
  refreshStatus: string = "no-refresh";

  // Pagination
  newsPager: any = {};
  newsPaged: NewsModel[] = [];
  newsLength: number = 10;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService
  ) {
  }

  ngOnInit() {
    this.refresh();
  }

  refresh(page: number = 1, force: boolean = false): void {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    if (this.pagerService.canChangePage(this.newsPager, page) || force) {
      this.organizationService.getNews(this.authenticationService.currentOrganizationValue.id, page - 1, this.newsLength)
        .subscribe(response => {
          this.news = response;
          this.setPage(page);
          this.refreshStatus = 'success';
          setTimeout(() => {
            this.refreshStatus = 'no-refresh';
          }, 2000);
        });
    }
  }

  setPage(page: number) {
    this.newsPager = this.pagerService.getPager(this.news.totalElements, page, this.newsLength);
    this.newsPaged = this.news.content;
    this.data = {};
    var projectIds = [];
    this.newsPaged.forEach(news => {
      var stringDate = formatDate(news.createdAt, 'dd/MM/yyyy', this.locale);
      if(!this.dates.find(date => date === stringDate)) {
        this.dates.push(stringDate);
      }
      if(this.data[stringDate] === undefined) {
        this.data[stringDate] = [];
      }
      if(news.project.id > 0) {
        projectIds.push(news.project.id);
      }
      this.data[stringDate].push(news);
    });
    this.projectService.getAllByIds(projectIds)
      .subscribe(response => {
        response.forEach(prj => this.projects[prj.id] = prj)
      },
      error => {
        console.log(error);
      });
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
