import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Account, Budget, Campaign, Content, News, Project, User } from 'src/app/_entities';
import { BudgetModel, CampaignModel, DonationModel, GenericModel, NewsModel } from 'src/app/_models';
import { AuthenticationService, BudgetService, CampaignService, ContentService, DonationService, OrganizationService, PagerService, ProjectService, UserService } from 'src/app/_services';

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
  campaignsBudgets: any = {};

  // Contributing Modal
  selectedCampaign: Campaign = new Campaign();
  contributeFinanciallyModalRef: BsModalRef;
  donationForm: FormGroup = this.formBuilder.group({
    budget: [0],
    amount: [10, [Validators.min(0), Validators.max(0)]]
  });
  accounts: Account[] = [];

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
    private budgetService: BudgetService,
    private campaignService: CampaignService,
    private contentService: ContentService,
    private donationService: DonationService,
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
        this.refreshAccounts();
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
          this.campaigns = Campaign.fromModels(campaignModels).sort((a, b) => {
            if(a.createdAt > b.createdAt) {
              return -1;
            } else if(a.createdAt < b.createdAt) {
              return 1;
            } else {
              return 0;
            }
          });
          var budgetsId = [];
          this.campaigns.forEach(campaign => {
            var remainingTime = Math.abs(new Date(campaign.fundingDeadline).getTime() - new Date().getTime());
            campaign.remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
            budgetsId.push(campaign.budgetsRef);
          });
          budgetsId = [... new Set(budgetsId)];
          this.budgetService.getAllByIds(budgetsId)
            .subscribe(response => {
              response.forEach(budget => {
                this.campaignsBudgets[budget.id] = budget;
              });
            });
          this.isUserInTeam = this.members.find(user => {
            return this.userLoggedIn.id === user.id;
          }) !== undefined;
          this.campaignsSyncStatus = 'success';
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

  refreshAccounts() {
    this.userService.getAccounts(this.userLoggedIn.id)
      .subscribe(accounts => {
        this.accounts = Account.fromModels(accounts);
      })
  }

  openContributingModal(template: TemplateRef<any>, campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.donationForm.controls.amount.setValidators([Validators.required, Validators.min(0.01), Validators.max(
      +(this.min(this.accounts[this.donationForm.controls.budget.value].amount, campaign.donationsRequired - campaign.totalDonations)).toFixed(2))]);  
    this.contributeFinanciallyModalRef = this.modalService.show(template);
  }

  onAccountSelectionChange() {
    this.donationForm.controls.amount.setValidators([Validators.required, Validators.min(0.01), Validators.max(
      +(this.min(this.accounts[this.donationForm.controls.budget.value].amount, this.selectedCampaign.donationsRequired - this.selectedCampaign.totalDonations)).toFixed(2))]);
  }

  onSubmitDonation() {

    if (this.donationForm.invalid) {
      return;
    }
    this.contributeFinanciallyModalRef.hide();
    var donation = new DonationModel();
    donation.amount = this.donationForm.controls.amount.value;
    donation.account = GenericModel.valueOf(this.accounts[this.donationForm.controls.budget.value].id);
    donation.campaign = GenericModel.valueOf(this.selectedCampaign.id);
    donation.budget = GenericModel.valueOf(this.accounts[this.donationForm.controls.budget.value].budget.id);
    donation.contributor = GenericModel.valueOf(this.userLoggedIn.id);

    this.donationService.create(donation)
      .subscribe(
        () => {
          this.contributeFinanciallyModalRef.hide();
        },
        error => {
          console.log(error);
        });
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
    this.campaign = new Campaign();
    this.formFunding.controls['budget'].enable();
    this.formFunding.controls['fundingDeadline'].enable();
    this.formFunding.controls['donationsRequired'].setValidators([Validators.required, Validators.min(0.01)]);
    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    this.openFundingModal(template);
  }

  editFundingModal(template: TemplateRef<any>, id: number) {
    this.formFunding.controls['budget'].disable();
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

  min(val1: number, val2: number): number {
    if(val1 > val2) {
      return val2;
    } else {
      return val1;
    }
  }

  get filterByCampaignBudgets() {
    return this.accounts.filter( a => this.selectedCampaign.budgetsRef.includes(a.budget.id));
  }
}
 