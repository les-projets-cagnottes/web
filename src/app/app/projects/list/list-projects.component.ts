import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CampaignModel, DataPage, ScoreModel, UserModel } from 'src/app/_models';
import { CampaignStatus } from 'src/app/_models/campaign/campaign-status';
import { Pager } from 'src/app/_models/pagination/pager/pager';
import { ProjectModel } from 'src/app/_models/project/project.model';
import { AuthenticationService, CampaignService, OrganizationService, PagerService, UserService, VoteService } from 'src/app/_services';

@Component({
  selector: 'app-list-projects',
  templateUrl: './list-projects.component.html',
  styleUrls: ['./list-projects.component.css']
})
export class ListProjectsComponent implements OnInit {

  // Data
  private projects = new DataPage<ProjectModel>();
  private campaigns = new Map<number, CampaignModel>();
  projectsTotalDonations = new Map<number, number>();
  projectsDonationsRequired = new Map<number, number>();
  projectsMissingBudget = new Map<number, boolean>();
  projectsScores = new Map<number, ScoreModel>();
  users = new Map<number, UserModel>();
  status = 'in_progress';

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
    private campaignService: CampaignService,
    private organizationService: OrganizationService,
    private userService: UserService,
    private voteService: VoteService
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
        .subscribe({
          next: (data) => {
            this.projects = data;
            this.setPage(page);
            this.getVotes();
            this.getUsers();
            this.getCampaigns();
            this.refreshStatus = 'success';
            setTimeout(() => {
              this.refreshStatus = 'no-refresh';
            }, 2000);
          },
          complete: () => { },
          error: error => {
            console.log(error);
          }
        });
    }
  }

  getVotes(): void {
    var projectIds: number[] = [];
    this.projects.content.forEach(project => projectIds.push(project.id));
    this.voteService.getScoreByProjectIds(projectIds)
      .subscribe({
        next: response => {
          response.forEach(scoreModel => this.projectsScores.set(scoreModel.projectId, scoreModel));
        },
        error: error => console.error(error)
      });
  }

  getUsers(): void {
    var userIds: number[] = [];
    this.projects.content.forEach(project => {
      project.peopleGivingTimeRef.forEach(userId => userIds.push(userId));
    });
    this.userService.getAllByIds(userIds)
      .subscribe({
        next: (data) => {
          data.forEach(user => {
            user.hasLeftTheOrganization = !this.authenticationService.currentOrganizationValue.membersRef.some(orgMemberId => orgMemberId == user.id);
            this.users.set(user.id, user);
          });
        },
        complete: () => { },
        error: error => {
          console.log(error);
        }
      });
  }

  getCampaigns(): void {
    var campaignIds: number[] = [];
    this.projects.content.forEach(project => {
      project.campaignsRef.forEach(campaignId => campaignIds.push(campaignId));
    });
    this.campaignService.getAllByIds(campaignIds)
      .subscribe({
        next: (data) => {
          data.forEach(campaign => this.campaigns.set(campaign.id, campaign));
          this.projectsPaged.forEach(project => {
            var projectCampaigns = data.filter(campaign => campaign.project.id === project.id);
            var projectTotalDonations = projectCampaigns.reduce((sum, current) => sum + current.totalDonations, 0);
            var projectDonationsRequired = projectCampaigns.reduce((sum, current) => {
              console.log(current.status + " : " + current.totalRequired);
              if (current.status != CampaignStatus.FAILED) {
                return sum + current.totalRequired
              } else {
                return sum
              }
            }, 0);
            this.projectsTotalDonations.set(project.id, projectTotalDonations);
            this.projectsDonationsRequired.set(project.id, projectDonationsRequired);
            this.projectsMissingBudget.set(project.id, projectTotalDonations < projectDonationsRequired);
          });
        },
        complete: () => { },
        error: error => {
          console.log(error);
        }
      });
  }
  setPage(page: number) {
    this.projectsPager = this.pagerService.getPager(this.projects.totalElements, page, this.projectsLength);
    this.projectsPaged = this.projects.content;
  }

}
