import { Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Budget, Campaign, Content, Donation, Project, User } from 'src/app/_entities';
import { AccountModel, BudgetModel, CampaignModel, DataPage, DonationModel, GenericModel, NewsModel, ProjectModel, ScoreModel, UserModel, VoteModel } from 'src/app/_models';
import { CampaignStatus } from 'src/app/_models/campaign/campaign-status';
import { Pager } from 'src/app/_models/pagination/pager/pager';
import { ProjectStatus } from 'src/app/_models/project/project-status';
import { VoteType } from 'src/app/_models/vote/vote-type';
import { AccountService, AuthenticationService, BudgetService, CampaignService, ContentService, DonationService, OrganizationService, PagerService, ProjectService, UserService, VoteService } from 'src/app/_services';
import { NavService } from 'src/app/_services/nav/nav.service';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {

  campaignStatus = CampaignStatus;
  projectStatus = ProjectStatus;
  voteType = VoteType;

  // Data
  id = 0;
  accounts: Map<number, AccountModel> = new Map<number, AccountModel>();
  users: Map<number, User> = new Map<number, User>();
  userLoggedIn = new User();
  project = new Project();
  leader = new User();
  score = new ScoreModel();
  vote = new VoteModel();

  // Informations Card
  isUserInTeam = false;

  // Campaigns Card
  campaigns: Campaign[] = [];
  campaignsSyncStatus = 'idle';
  campaignsBudgets = new Map<number, BudgetModel>();

  // Publish Idea Modal
  publishIdeaModalRef = new BsModalRef();
  publishIdeaForm: UntypedFormGroup = this.formBuilder.group({
    ideaHasAnonymousCreator: [false],
    ideaHasLeaderCreator: [false]
  });

  // Start Project Modal
  startProjectModalRef = new BsModalRef();
  startProjectForm: UntypedFormGroup = this.formBuilder.group({
    peopleRequired: [2, [Validators.required, Validators.min(2)]]
  });

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
    daysRequired: [0],
    hoursRequired: [0],
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
    public navService: NavService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private userService: UserService,
    private voteService: VoteService) {
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
        this.navService.setTitle(this.project.title);
        this.refreshVote();
        this.refreshLeader();
        this.refreshMembers();
        this.refreshCampaigns();
        this.refreshNews();
      });
  }

  refreshVote() {
    if(this.project.status == this.projectStatus.IDEA) {
      this.vote = new VoteModel();
      this.voteService.getUserVote(this.project.id)
        .subscribe({
          next: voteModel => {
            this.vote = voteModel;
          },
          error: error => console.error(error)
        });
      this.voteService.getScoreByProjectId(this.project.id)
        .subscribe({
          next: scoreModel => {
            this.score = scoreModel;
          },
          error: error => console.error(error)
        });
    }
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
              if (a.createdAt > b.createdAt) {
                return -1;
              } else if (a.createdAt < b.createdAt) {
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
        .subscribe({
          next: (response) => {
            this.news = response;
            this.setNewsPage(page);
            const userIds: number[] = [];
            response.content.forEach(news => {
              if (!userIds.find(id => id === news.author.id)) {
                userIds.push(news.author.id);
              }
            });
            this.userService.getAllByIds(userIds)
              .subscribe({
                next: (response) => {
                  response.forEach(user => {
                    this.users.set(user.id, User.fromModel(user));
                  });
                  this.newsSyncStatus = 'success';
                  setTimeout(() => {
                    this.newsSyncStatus = 'idle';
                  }, 2000);
                },
                complete: () => { },
                error: error => {
                  this.newsSyncStatus = 'error';
                  console.log(error);
                  setTimeout(() => {
                    this.newsSyncStatus = 'idle';
                  }, 1000);
                }
              });
          },
          complete: () => { },
          error: error => {
            this.newsSyncStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.newsSyncStatus = 'idle';
            }, 1000)
          }
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
    this.formFunding.controls['daysRequired'].setValue(this.campaign.daysRequired);
    this.formFunding.controls['hoursRequired'].setValue(this.campaign.hoursRequired);
    this.addFundingModal = this.modalService.show(template);
  }

  openAddFundingModal(template: TemplateRef<string>) {
    this.campaign = new Campaign();
    this.formFunding.controls['budget'].enable();
    this.formFunding.controls['fundingDeadline'].enable();
    this.formFunding.controls['donationsRequired'].setValidators([Validators.required, Validators.min(0.01)]);
    this.formFunding.controls['daysRequired'].setValue(0);
    this.formFunding.controls['hoursRequired'].setValue(0);
    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    this.openFundingModal(template);
  }

  editFundingModal(template: TemplateRef<string>, id: number) {
    this.formFunding.controls['budget'].disable();
    this.formFunding.controls['fundingDeadline'].disable();
    this.formFunding.controls['donationsRequired'].setValidators([Validators.required, Validators.min(this.campaign.donationsRequired)]);
    this.formFunding.controls['daysRequired'].setValue(this.campaign.daysRequired);
    this.formFunding.controls['hoursRequired'].setValue(this.campaign.hoursRequired);
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
            if (!accountIds.find(id => id === donation.account.id)) {
              accountIds.push(donation.account.id);
            }
          });
          this.accountService.getAllByIds(accountIds)
            .subscribe(response => {
              const userIds: number[] = [];
              response.forEach(account => {
                this.accounts.set(account.id, account);
                if (!userIds.find(id => id === account.owner.id)) {
                  userIds.push(account.owner.id);
                }
              });
              this.userService.getAllByIds(userIds)
                .subscribe({
                  next: (response) => {
                    response.forEach(user => {
                      this.users.set(user.id, User.fromModel(user));
                    });
                    this.donationsSyncStatus = 'success';
                    setTimeout(() => {
                      this.donationsSyncStatus = 'idle';
                    }, 2000);
                  },
                  complete: () => { },
                  error: error => {
                    this.donationsSyncStatus = 'error';
                    console.log(error);
                    setTimeout(() => {
                      this.donationsSyncStatus = 'idle';
                    }, 1000);
                  }
                });
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
        next: () => { },
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
    if (this.id == 0 && this.getFundingDeadlineValue().getTime() > this.nowPlus3Months.getTime()) {
      return;
    }

    // Set submitting state as true
    this.submittingFunding = true;

    const campaignToSave = new CampaignModel();
    campaignToSave.donationsRequired = this.formFunding.controls['donationsRequired'].value;
    campaignToSave.daysRequired = this.formFunding.controls['daysRequired'].value;
    campaignToSave.hoursRequired = this.formFunding.controls['hoursRequired'].value;
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
    if (this.formFunding.controls['fundingDeadline'].value == "NaN-aN-aN") {
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

  openModal(template: TemplateRef<string>) {
    this.startProjectModalRef = this.modalService.show(template);
  }

  onSubmitVote(voteType: VoteType) {
    const submittedVote = new VoteModel();
    submittedVote.project.id = this.id;
    submittedVote.type = voteType;
    this.voteService.vote(submittedVote)
      .subscribe({
        next: () => {
          this.refreshVote();
        },
        complete: () => { },
        error: error => {
          console.error(error);
        }
      });
  }

  publishIdeaSubmit() {

    const submittedProject = new ProjectModel();
    submittedProject.id = this.id;
    submittedProject.title = this.project.title;
    submittedProject.shortDescription = this.project.shortDescription;
    submittedProject.longDescription = this.project.longDescription;
    submittedProject.workspace = this.project.workspace;
    submittedProject.ideaHasAnonymousCreator = this.publishIdeaForm.controls['ideaHasAnonymousCreator'].value;
    submittedProject.ideaHasLeaderCreator = this.publishIdeaForm.controls['ideaHasLeaderCreator'].value;
    submittedProject.organization.id = this.authenticationService.currentOrganizationValue.id;
    submittedProject.status = ProjectStatus.IDEA;

    if (!submittedProject.ideaHasAnonymousCreator) {
      submittedProject.leader.id = this.project.leader.id;
    } else {
      submittedProject.leader.id = 0;
    }

    this.projectService.update(submittedProject)
      .subscribe({
        next: () => {
          this.startProjectModalRef.hide();
          this.refresh();
        },
        complete: () => { },
        error: error => {
          console.error(error);
        }
      });
  }

  startProjectSubmit() {

    const submittedProject = new ProjectModel();
    submittedProject.id = this.id;
    submittedProject.title = this.project.title;
    submittedProject.shortDescription = this.project.shortDescription;
    submittedProject.longDescription = this.project.longDescription;
    submittedProject.workspace = this.project.workspace;
    submittedProject.ideaHasAnonymousCreator = this.project.ideaHasAnonymousCreator;
    submittedProject.ideaHasLeaderCreator = this.project.ideaHasLeaderCreator;
    submittedProject.organization.id = this.authenticationService.currentOrganizationValue.id;

    if (this.project.leader.id > 0) {
      submittedProject.leader.id = this.project.leader.id;
    } else {
      submittedProject.leader.id = this.authenticationService.currentUserValue.id;
    }

    if (this.project.status != ProjectStatus.FINISHED) {
      submittedProject.peopleRequired = this.startProjectForm.controls['peopleRequired'].value;
    } else {
      submittedProject.peopleRequired = this.project.peopleRequired;
    }
    submittedProject.status = ProjectStatus.IN_PROGRESS;

    this.projectService.update(submittedProject)
      .subscribe({
        next: () => {
          this.startProjectModalRef.hide();
          this.refresh();
        },
        complete: () => { },
        error: error => {
          console.error(error);
        }
      });
  }

  reopen() {
    this.startProjectSubmit();
  }

  pause() {
    this.projectService.updateStatus(this.id, ProjectStatus.ON_PAUSE)
      .subscribe(() => {
        this.refresh();
      })
  }

  finish() {
    this.projectService.updateStatus(this.id, ProjectStatus.FINISHED)
      .subscribe(() => {
        this.refresh();
      })
  }

  min(val1: number, val2: number): number {
    if (val1 > val2) {
      return val2;
    } else {
      return val1;
    }
  }

  getBudget(id: number): BudgetModel {
    let entity = this.campaignsBudgets.get(id);
    if (entity === undefined) {
      entity = new BudgetModel();
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

  getContributorFromAccountId(accountId: number): User {
    const account = this.accounts.get(accountId);
    let user;
    if (account !== undefined) {
      user = this.users.get(account.owner.id);
      if (user !== undefined) {
        return user;
      }
    }
    return new User()
  }

}
