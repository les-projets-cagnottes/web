import { Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Budget, Campaign, Content, Donation, Project, User } from 'src/app/_entities';
import { AccountModel, BudgetModel, CampaignModel, DataPage, DonationModel, GenericModel, NewsModel, UserModel } from 'src/app/_models';
import { CampaignStatus } from 'src/app/_models/campaign/campaign-status';
import { Pager } from 'src/app/_models/pagination/pager/pager';
import { ProjectStatus } from 'src/app/_models/project/project-status';
import { AccountService, AuthenticationService, BudgetService, CampaignService, ContentService, DonationService, OrganizationService, PagerService, ProjectService, UserService } from 'src/app/_services';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {

  campaignStatus = CampaignStatus;
  projectStatus = ProjectStatus;

  // Data
  id = 0;
  accounts: Map<number, AccountModel> = new Map<number, AccountModel>();
  users: Map<number, UserModel> = new Map<number, UserModel>();
  userLoggedIn = new User();
  project = new Project();
  leader = new User();

  // Informations Card
  isUserInTeam = false;

  // Campaigns Card
  campaigns: Campaign[] = [];
  campaignsSyncStatus = 'idle';
  campaignsBudgets = new Map<number, BudgetModel>();

  // Contributing Modal
  selectedCampaign = new Campaign();
  account = new AccountModel();
  contributeFinanciallyModalRef = new BsModalRef();
  donationForm = this.formBuilder.group({
    amount: [10, [Validators.min(0), Validators.max(0)]]
  });

  // Funding Modal
  private campaign = new CampaignModel();
  budgets: Budget[] = [];
  addFundingModal: BsModalRef = new BsModalRef();
  formFunding: UntypedFormGroup = this.formBuilder.group({
    budget: [0],
    fundingDeadline: ['', Validators.pattern("\\d{4}-\\d{2}-\\d{2}")],
    donationsRequired: [0, [Validators.required, Validators.min(0.01)]],
    rulesCompliant: [false, Validators.pattern("true")]
  });
  submittingFunding = false;
  minDonations = "0.00";

  // View Donations Modal
  viewDonationsSelectedCampaign = new CampaignModel();
  viewDonationsModal = new BsModalRef();
  donationsPager = new Pager();
  donationsPaged: Donation[] = [];
  donationsLength = 10;
  donationsSyncStatus = 'idle';
  deleteDonationsStatus: string[] = [];

  // Rules Modal
  viewRulesModal = new BsModalRef();
  rules = new Content();

  // Funding Deadline field
  now = new Date();
  nowPlus3Months = new Date();
  fundingDeadlineValue = new Date();

  // Members Box
  members: User[] = [];
  membersSyncStatus = 'idle';
  organizationSocialName = '';
  
  // News Box
  news = new DataPage<NewsModel>();
  newsPager = new Pager();
  newsPaged: NewsModel[] = [];
  newsLength = 100;
  newsSyncStatus = 'idle';

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private campaignService: CampaignService,
    private contentService: ContentService,
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private userService: UserService) {
    this.route.params.subscribe(params => this.id = params['id']);
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    this.organizationSocialName = this.authenticationService.currentOrganizationValue.socialName;
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
    this.projectService.getTeammates(this.project.id)
    .subscribe(members => {
      this.membersSyncStatus = 'success';
      this.members = User.fromModels(members);
      this.members.forEach(member => {
        member.hasLeftTheOrganization = !this.authenticationService.currentOrganizationValue.membersRef.some(orgMemberId => orgMemberId == member.id);
      });
      this.isUserInTeam = this.members.find(user => {
        return this.userLoggedIn.id === user.id;
      }) !== undefined;
      setTimeout(() => {
        this.membersSyncStatus = 'idle';
      }, 1000);
    }, error => {
      console.log(error);
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
          let budgetsId: number[] = [];
          this.campaigns.forEach(campaign => {
            const remainingTime = Math.abs(new Date(campaign.fundingDeadline).getTime() - new Date().getTime());
            campaign.remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
            budgetsId.push(campaign.budget.id);
          });
          budgetsId = [... new Set(budgetsId)];
          this.budgetService.getAllByIds(budgetsId)
            .subscribe(response => {
              response.forEach(budget => {
                this.campaignsBudgets.set(budget.id, budget);
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
          console.error(error);
          setTimeout(() => {
            this.campaignsSyncStatus = 'idle';
          }, 1000);
        });
      });
  }

  refreshNews(page = 1, force = false): void {
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

  openContributingModal(template: TemplateRef<string>, campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.accountService.getByBudgetAndUser(this.selectedCampaign.budget.id, this.userLoggedIn.id)
      .subscribe(account => {
        this.account = account;
        this.donationForm.controls['amount'].setValidators([Validators.required, Validators.min(0.01), Validators.max(
          +(this.min(account.amount, campaign.donationsRequired - campaign.totalDonations)).toFixed(2))]);
        this.contributeFinanciallyModalRef = this.modalService.show(template);
      });
  }

  onSubmitDonation() {

    if (this.donationForm.invalid) {
      return;
    }
    this.contributeFinanciallyModalRef.hide();
    const donation = new DonationModel();
    donation.amount = this.donationForm.controls['amount'].value;
    donation.campaign = GenericModel.valueOf(this.selectedCampaign.id);
    donation.account = this.account;

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
  
  openFundingModal(template: TemplateRef<string>) {
    this.refreshBudgets();
    this.formFunding.controls['fundingDeadline'].setValue(this.dateToString(this.campaign.fundingDeadline));
    this.formFunding.controls['donationsRequired'].setValue(this.campaign.donationsRequired);
    this.addFundingModal = this.modalService.show(template);
  }

  openAddFundingModal(template: TemplateRef<string>) {
    this.campaign = new Campaign();
    this.formFunding.controls['budget'].enable();
    this.formFunding.controls['fundingDeadline'].enable();
    this.formFunding.controls['donationsRequired'].setValidators([Validators.required, Validators.min(0.01)]);
    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    this.openFundingModal(template);
  }

  editFundingModal(template: TemplateRef<string>, id: number) {
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

  onViewTermsOfUse(template: TemplateRef<string>) {
    this.contentService.getById(this.budgets[this.formFunding.controls['budget'].value].rules.id)
      .subscribe(content => {
        this.rules = Content.fromModel(content);
        this.viewRulesModal = this.modalService.show(template);
      });
  }

  openDonationsModal(template: TemplateRef<string>, campaign: CampaignModel) {
    this.viewDonationsSelectedCampaign = campaign;
    this.refreshDonations(campaign.id, 1);
    this.viewDonationsModal = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-lg' })
    );
  }

  refreshDonations(campaignId: number, page = 1) {
    if (this.pagerService.canChangePage(this.donationsPager, page)) {
      this.donationsSyncStatus = 'running';
      this.campaignService.getDonations(campaignId, page - 1, this.donationsLength)
        .subscribe(response => {
          this.setDonationsPage(page, response);
          const accountIds: number[] = [];
          this.donationsPaged.forEach(donation => {
            if(!accountIds.find(id => id === donation.account.id)) {
              accountIds.push(donation.account.id);
            }
          });
          this.accountService.getAllByIds(accountIds)
            .subscribe(response => {
              const userIds: number[] = [];
              response.forEach(account => {
                this.accounts.set(account.id, account);
                if(!userIds.find(id => id === account.owner.id)) {
                  userIds.push(account.owner.id);
                }
              });
              this.userService.getAllByIds(userIds)
                .subscribe(response => {
                  response.forEach(user => {
                    this.users.set(user.id, user);
                  });
                  this.donationsSyncStatus = 'success';
                  setTimeout(() => {
                    this.donationsSyncStatus = 'idle';
                  }, 2000);
                }, error => {
                  this.donationsSyncStatus = 'error';
                  console.log(error);
                  setTimeout(() => {
                    this.donationsSyncStatus = 'idle';
                  }, 1000);
                })
            }, error => {
              this.donationsSyncStatus = 'error';
              console.log(error);
              setTimeout(() => {
                this.donationsSyncStatus = 'idle';
              }, 1000);
            })
        }, error => {
          this.donationsSyncStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.donationsSyncStatus = 'idle';
          }, 1000)
        });
    }
  }
  
  setDonationsPage(page: number, donations: DataPage<DonationModel>) {
    this.donationsPager = this.pagerService.getPager(donations.totalElements, page, this.donationsLength);
    this.donationsPaged = Donation.fromModels(donations.content);
  }

  deleteDonations(donation: Donation) {
    this.donationService.delete(donation.id)
      .subscribe({
        next: () => {},
        complete: () => {
          this.refreshDonations(this.viewDonationsSelectedCampaign.id, this.donationsPager.currentPage);
        },
        error: error => {
          console.log(error);
          this.deleteDonationsStatus[donation.id] = 'error';
        }
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

    const campaignToSave = new CampaignModel();
    campaignToSave.donationsRequired = this.formFunding.controls['donationsRequired'].value;
    campaignToSave.budget.id = this.budgets[this.formFunding.controls['budget'].value].id;
    campaignToSave.project.id = this.project.id;

    // Submit item to backend
    if (this.campaign.id > 0) {
      campaignToSave.id = this.campaign.id
      this.campaignService.update(campaignToSave)
        .subscribe(
          () => {
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
          () => {
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
    const dateParsed = new Date(date)
    return dateParsed.getFullYear() + "-" + ("0" + (dateParsed.getMonth() + 1)).slice(-2) + "-" + ("0" + dateParsed.getDate()).slice(-2);
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
    this.projectService.updateStatus(this.id, ProjectStatus.IN_PROGRESS)
      .subscribe(() => {
        this.refresh();
      })
  }

  reopen() {
    this.publish();
  }

  finish() {
    this.projectService.updateStatus(this.id, ProjectStatus.FINISHED)
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

  getContributorFromAccountId(accountId: number): UserModel {
    const account = this.accounts.get(accountId);
    let user;
    if(account !== undefined) {
      user = this.users.get(account.owner.id);
      if(user !== undefined) {
        return user;
      }
    }
    return new UserModel()
  }

}
 