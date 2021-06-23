import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Campaign, News, Project, User } from 'src/app/_entities';
import { NewsModel } from 'src/app/_models';
import { AuthenticationService, CampaignService, PagerService, ProjectService, UserService } from 'src/app/_services';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {

  id: number;
  userLoggedIn: User;
  project: Project = new Project();
  leader: User = new User();
  isUserInTeam: boolean = false;

  // Campaigns Box
  campaigns: Campaign[] = [];
  campaignsSyncStatus: string = 'idle';

  // Members Box
  members: User[] = [];
  membersSyncStatus: string = 'idle';
  
  // News Box
  news: any = {};
  newsPager: any = {};
  newsPaged: NewsModel[] = [];
  newsLength: number = 10;
  newsSyncStatus: string = 'idle';

  constructor(
    private route: ActivatedRoute,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private campaignService: CampaignService,
    private projectService: ProjectService,
    private userService: UserService) {
    this.route.params.subscribe(params => this.id = params.id);
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    this.projectService.getById(this.id)
      .subscribe(response => {
        this.project = Project.fromModel(response);
        this.refreshLeader();
        this.refreshMembers();
        this.refreshCampaigns();
        this.refreshNews();
      });
  }

  refreshLeader() {
    this.userService.getById(this.project.leader.id)
      .subscribe(leader => {
        this.leader = User.fromModel(leader);
      });
  }

  refreshMembers() {
    this.membersSyncStatus = 'running';
    this.userService.getAllByIds(this.project.peopleGivingTimeRef)
    .subscribe(members => {
      this.membersSyncStatus = 'success';
      this.members = User.fromModels(members);
      this.isUserInTeam = this.members.find(user => {
        return this.userLoggedIn.id === user.id;
      }) !== undefined;
      setTimeout(() => {
        this.membersSyncStatus = 'idle';
      }, 1000);
    }, error => {
      this.membersSyncStatus = 'error';
      setTimeout(() => {
        this.membersSyncStatus = 'idle';
      }, 1000);
    });
  }

  refreshCampaigns() {
    this.campaignsSyncStatus = 'running';
    this.campaignService.getAllByIds(this.project.campaignsRef)
    .subscribe(campaignModels => {
      this.campaignsSyncStatus = 'success';
      this.campaigns = Campaign.fromModels(campaignModels);
      this.isUserInTeam = this.members.find(user => {
        return this.userLoggedIn.id === user.id;
      }) !== undefined;
      setTimeout(() => {
        this.campaignsSyncStatus = 'idle';
      }, 1000);
    }, error => {
      this.campaignsSyncStatus = 'error';
      setTimeout(() => {
        this.campaignsSyncStatus = 'idle';
      }, 1000);
    });
  }

  refreshNews(page: number = 1, force: boolean = false): void {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    if (this.pagerService.canChangePage(this.newsPager, page) || force) {
      this.projectService.getNews(this.id, page - 1, this.newsLength)
        .subscribe(response => {
          this.news = response;
          this.setNewsPage(page);
          this.newsSyncStatus = 'success';
          setTimeout(() => {
            this.newsSyncStatus = 'idle';
          }, 2000);
        }, error => {
          this.newsSyncStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.newsSyncStatus = 'idle';
          }, 1000)
        });
    }
  }
  
  setNewsPage(page: number) {
    this.newsPager = this.pagerService.getPager(this.news.totalElements, page, this.newsLength);
    this.newsPaged = this.news.content;
  }


  join() {
    this.projectService.join(this.id)
      .subscribe(() => {
        this.refresh();
      })
  }

  publish() {
    this.projectService.publish(this.id)
      .subscribe(() => {
        this.refresh();
      })
  }

  openCampaignModel(id: number) {
    console.log(id);
  }
}
