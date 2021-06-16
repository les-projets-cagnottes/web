import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Campaign, Project, User } from 'src/app/_entities';
import { AuthenticationService, CampaignService, ProjectService, UserService } from 'src/app/_services';

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
  members: User[] = [];

  isUserInTeam: boolean = false;

  // Donations Box
  campaigns: Campaign[] = [];
  campaignsSyncStatus: string = 'idle';

  // Members Box
  membersSyncStatus: string = 'idle';
  
  constructor(
    private route: ActivatedRoute,
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

  computeDatePercent(start: Date, deadline: Date) {
    var now = new Date();
    var totalDuration = deadline.getTime() - start.getTime();
    var expiredDuration = now.getTime() - start.getTime();
    return this.computeNumberPercent(expiredDuration, totalDuration);
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "100";
    }
    return 100 * number / max;
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
