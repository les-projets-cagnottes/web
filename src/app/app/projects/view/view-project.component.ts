import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Budget, Campaign, Content, News, Project, User } from 'src/app/_entities';
import { CampaignModel, NewsModel } from 'src/app/_models';
import { AuthenticationService, CampaignService, ContentService, OrganizationService, PagerService, ProjectService, UserService } from 'src/app/_services';

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

  // Funding Modal
  private campaign: CampaignModel = new CampaignModel();
  budgets: Budget[] = [];
  addFundingModal: BsModalRef;
  formFunding: FormGroup = this.formBuilder.group({
    budget: [0],
    fundingDeadline: ['', Validators.pattern("\\d{4}-\\d{2}-\\d{2}")],
    donationsRequired: [0, [Validators.required, Validators.min(0.01)]],
    rulesCompliant: [false, Validators.pattern("true")]
  });
  submittingFunding: boolean;
  minDonations: string = "0.00";

  // Rules Modal
  viewRulesModal: BsModalRef;
  rules: Content = new Content();

  // Funding Deadline field
  now: Date = new Date();
  nowPlus3Months = new Date();
  fundingDeadlineValue = new Date();

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
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private campaignService: CampaignService,
    private contentService: ContentService,
    private organizationService: OrganizationService,
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
    this.projectService.getById(this.id)
      .subscribe(response => {
        this.project = Project.fromModel(response);
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

  refreshBudgets() {
    this.organizationService.getUsableBudgets(this.authenticationService.currentOrganizationValue.id)
      .subscribe(budgets => {
        this.budgets = Budget.fromModels(budgets);
        this.formFunding.controls['budget'].setValue(0);
      });
  }
  
  openFundingModal(template: TemplateRef<any>) {
    this.refreshBudgets();
    this.formFunding.controls['fundingDeadline'].setValue(this.dateToString(this.campaign.fundingDeadline));
    this.formFunding.controls['donationsRequired'].setValue(this.campaign.donationsRequired);
    this.addFundingModal = this.modalService.show(template);
  }

  openAddFundingModal(template: TemplateRef<any>) {
    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    this.openFundingModal(template);
  }

  editFundingModal(template: TemplateRef<any>, id: number) {
    this.formFunding.controls['fundingDeadline'].disable();
    this.formFunding.controls['donationsRequired'].setValidators([Validators.required, Validators.min(this.campaign.donationsRequired)]);
    this.minDonations = this.campaign.donationsRequired.toString();
    this.campaignService.getById(id)
      .subscribe(response => {
        this.campaign = response;
        this.openFundingModal(template);
      });
  }

  onViewTermsOfUse(template: TemplateRef<any>) {
    this.contentService.getById(this.budgets[this.formFunding.controls.budget.value].rules.id)
      .subscribe(content => {
        this.rules = Content.fromModel(content);
        this.viewRulesModal = this.modalService.show(template);
      });
  }

  get fFunding() { return this.formFunding.controls; }

  onSubmitFunding() {

    // If form is invalid, avort
    if (this.formFunding.invalid) {
      return;
    }
    if(this.id == 0 && this.getFundingDeadlineValue().getTime() > this.nowPlus3Months.getTime() ) {
      return;
    }

    // Set submitting state as true
    this.submittingFunding = true;

    var campaignToSave = new CampaignModel();
    campaignToSave.donationsRequired = this.formFunding.controls.donationsRequired.value;
    campaignToSave.budgetsRef = [this.budgets[this.formFunding.controls.budget.value].id];
    campaignToSave.project.id = this.project.id;

    // Submit item to backend
    if (this.campaign.id > 0) {
      campaignToSave.id = this.campaign.id
      this.campaignService.update(campaignToSave)
        .subscribe(
          response => {
            this.submittingFunding = false;
            this.addFundingModal.hide();
            this.refreshCampaigns();
          },
          error => {
            console.log(error);
            this.submittingFunding = false;
          });
    } else {
      campaignToSave.fundingDeadline = this.getFundingDeadlineValue()
      this.campaignService.create(campaignToSave)
        .subscribe(
          response => {
            this.submittingFunding = false;
            this.addFundingModal.hide();
            this.refreshCampaigns();
          },
          error => {
            console.log(error);
            this.submittingFunding = false;
          });
    }
  }

  dateToString(date: Date) {
    var date = new Date(date);
    return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
  }

  getFundingDeadlineValue() {
    if(this.formFunding.controls['fundingDeadline'].value == "NaN-aN-aN") {
      return new Date(this.fundingDeadlineValue);
    } else {
      return new Date(this.formFunding.controls['fundingDeadline'].value);
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

}
