import { Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Account, Budget, Content, User } from 'src/app/_entities';
import { AccountModel, CampaignModel, DataPage, ProjectModel } from 'src/app/_models';
import { Pager } from 'src/app/_models/pagination/pager/pager';
import { AuthenticationService, BudgetService, ContentService, OrganizationService, PagerService, ProjectService } from 'src/app/_services';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  projects: Map<number, ProjectModel> = new Map<number, ProjectModel>();
  budgets: Budget[] = [];
  budget: Budget = new Budget();
  budgetUsage = "";

  // Form
  selectBudgetForm = this.fb.group({
    budget: [0]
  });

  // Rules Modal
  viewRulesModal = new BsModalRef();
  rules = new Content();

  // Campaigns Box
  private rawProjectsResponse = new DataPage<CampaignModel>();
  campaignPager = new Pager();
  pagedCampaigns: CampaignModel[] = [];
  campaignsPageSize = 10;
  campaignsSyncStatus = 'idle';

  // Accounts Box
  private rawAccountsResponse: DataPage<AccountModel> = new DataPage<AccountModel>();
  accountsPager = new Pager();
  pagedAccounts: Account[] = [];
  accountsPageSize = 24;
  accountsSyncStatus = 'idle';

  constructor(
    private modalService: BsModalService,
    private fb: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private contentService: ContentService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private pagerService: PagerService) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.organizationService.getBudgets(this.authenticationService.currentOrganizationValue.id)
      .subscribe(budgets => {
        this.budgets = Budget.fromModels(budgets);
        this.selectBudgetForm.controls['budget'].setValue(this.budgets[0].id);
      });
    this.selectBudgetForm.controls['budget'].valueChanges.subscribe(val => {
      const budgetFound = this.budgets.find(budget => budget.id === +val);
      if (budgetFound !== undefined) {
        this.budget = budgetFound;
        this.budgetUsage = this.computeNumberPercent(this.budget.totalDonations, this.authenticationService.currentOrganizationValue.membersRef.length * this.budget.amountPerMember) + "%";
        this.refreshCampaigns(this.campaignPager.currentPage);
        this.refreshAccounts(this.accountsPager.currentPage);
      }
    });
  }

  refreshCampaigns(page = 1) {
    if (this.pagerService.canChangePage(this.campaignPager, page)) {
      this.campaignsSyncStatus = 'running';
      this.budgetService.getCampaigns(this.selectBudgetForm.controls['budget'].value, page - 1, this.campaignsPageSize)
        .subscribe({
          next: (response) => {
            this.rawProjectsResponse = response;
            this.setCampaignsPage(page);
            const projectIds: number[] = [];
            this.pagedCampaigns.forEach(campaign => {
              if (campaign.project.id > 0) {
                projectIds.push(campaign.project.id);
              }
            });
            this.projectService.getAllByIds(projectIds)
              .subscribe({
                next: (response) => response.forEach(prj => this.projects.set(prj.id, prj)),
                complete: () => { },
                error: error => {
                  console.log(error);
                }
              });
            this.campaignsSyncStatus = 'success';
            setTimeout(() => {
              this.campaignsSyncStatus = 'idle';
            }, 1000);

          },
          complete: () => { },
          error: error => {
            this.campaignsSyncStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.campaignsSyncStatus = 'idle';
            }, 1000);

          }
        });
    }
  }

  refreshAccounts(page = 1) {
    if (this.pagerService.canChangePage(this.accountsPager, page)) {
      this.accountsSyncStatus = 'running';
      this.budgetService.getAccounts(this.selectBudgetForm.controls['budget'].value, page - 1, this.accountsPageSize)
        .subscribe(response => {
          this.rawAccountsResponse = response;
          this.setAccountsPage(page);
          const accountUserRef = []
          this.pagedAccounts.forEach(account => accountUserRef.push(account.owner.id));
          this.budgetService.getUsers(this.selectBudgetForm.controls['budget'].value)
            .subscribe({
              next: (users) => {
                this.pagedAccounts.forEach(account => account.setOwner(User.fromModels(users)));
                this.accountsSyncStatus = 'success';
                setTimeout(() => {
                  this.accountsSyncStatus = 'idle';
                }, 1000);
              },
              complete: () => { },
              error: error => {
                this.accountsSyncStatus = 'error';
                console.log(error);
                setTimeout(() => {
                  this.accountsSyncStatus = 'idle';
                }, 1000);
              }
            });
        });
    }
  }

  setCampaignsPage(page: number) {
    this.campaignPager = this.pagerService.getPager(this.rawProjectsResponse.totalElements, page, this.campaignsPageSize);
    this.pagedCampaigns = this.rawProjectsResponse.content;
  }

  setAccountsPage(page: number) {
    this.accountsPager = this.pagerService.getPager(this.rawAccountsResponse.totalElements, page, this.accountsPageSize);
    this.pagedAccounts = [];
    this.rawAccountsResponse.content.forEach(model => {
      const account = Account.fromModel(model);
      account.usage = this.computeNumberPercent(account.amount, account.initialAmount) + "%";
      this.pagedAccounts.push(account);
    });
  }

  getProject(id: number): ProjectModel {
    let entity = this.projects.get(id);
    if (entity === undefined) {
      entity = new ProjectModel();
    }
    return entity;
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "0";
    }
    return 100 * number / max;
  }
  
  onViewTermsOfUse(template: TemplateRef<string>) {
    this.contentService.getById(this.budget.rules.id)
      .subscribe(content => {
        this.rules = Content.fromModel(content);
        this.viewRulesModal = this.modalService.show(template);
      });
  }
}
