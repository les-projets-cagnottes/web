import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Project, User } from 'src/app/_entities';
import { DataPage, NewsModel } from 'src/app/_models';
import { Pager } from 'src/app/_models/pagination/pager/pager';
import { AuthenticationService, OrganizationService, PagerService, ProjectService, UserService } from 'src/app/_services';

@Component({
  selector: 'app-news',
  templateUrl: './list-news.component.html',
  styleUrls: ['./list-news.component.css']
})
export class ListNewsComponent implements OnInit {

  // Data
  projects = new Map<number, Project>();
  users = new Map<number, User>();
  userLoggedIn: User = new User();

  // Refreshing state
  refreshStatus = "no-refresh";

  // Pagination
  private news = new DataPage<NewsModel>();
  newsPager = new Pager();
  newsPaged: NewsModel[] = [];
  newsLength = 20;
  newsByDate = new Map<string, NewsModel[]>();
  dates: string[] = [];

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh(page = 1): void {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    if (this.pagerService.canChangePage(this.newsPager, page)) {
      this.organizationService.getNews(this.authenticationService.currentOrganizationValue.id, page - 1, this.newsLength)
        .subscribe({
          next: (response) => {
            this.news = response;
            this.setPage(page);
            this.refreshStatus = 'success';
            setTimeout(() => {
              this.refreshStatus = 'no-refresh';
            }, 2000);
          },
          complete: () => { },
          error: error => {
            console.error(error);
          }
        });
    }
  }

  onScroll() {
    this.refresh(this.newsPager.currentPage + 1);
  }

  setPage(page: number) {
    this.newsPager = this.pagerService.getPager(this.news.totalElements, page, this.newsLength);
    this.newsPaged = [...this.newsPaged, ...this.news.content];
    const projectIds: number[] = [];
    const userIds: number[] = [];
    this.newsByDate = new Map<string, NewsModel[]>();
    this.newsPaged.forEach(news => {
      const stringDate = formatDate(news.createdAt, 'dd/MM/yyyy', this.locale);
      if (!this.dates.find(date => date === stringDate)) {
        this.dates.push(stringDate);
      }
      if (news.project.id > 0) {
        projectIds.push(news.project.id);
      }
      if (news.author.id > 0) {
        userIds.push(news.author.id);
      }
      const newsForDate = this.newsByDate.get(stringDate) || [];
      newsForDate.push(news);
      this.newsByDate.set(stringDate, newsForDate);
    });
    this.projectService.getAllByIds(projectIds)
      .subscribe({
        next: (response) => {
          response.forEach(model => this.projects.set(model.id, Project.fromModel(model)))
        },
        complete: () => { },
        error: error => {
          console.error(error);
        }
      });
    this.userService.getAllByIds(userIds)
      .subscribe({
        next: (response) => {
          response.forEach(model => this.users.set(model.id, User.fromModel(model)))
        },
        complete: () => { },
        error: error => {
          console.error(error);
        }
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

  getProject(id: number): Project {
    let entity = this.projects.get(id);
    if (entity === undefined) {
      entity = new Project();
    }
    return entity;
  }

  getUser(id: number): User {
    let entity = this.users.get(id);
    if (entity === undefined) {
      entity = new User();
    }
    return entity;
  }

}
