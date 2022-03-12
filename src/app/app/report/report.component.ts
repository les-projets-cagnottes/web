import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Account, Budget, Campaign, User } from 'src/app/_entities';
import { CampaignModel, DataPage, ProjectModel } from 'src/app/_models';
import { AuthenticationService, BudgetService, OrganizationService, PagerService, ProjectService, UserService } from 'src/app/_services';

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

  // Campaigns Box
  private rawProjectsResponse: any;
  campaignPager: any = {};
  pagedCampaigns: Campaign[] = [];
  campaignsPageSize = 10;
  campaignsSyncStatus = 'idle';

  // Accounts Box
  private rawAccountsResponse: DataPage = new DataPage();
  accountsPager: any = {};
  pagedAccounts: Account[] = [];
  accountsPageSize = 10;
  accountsSyncStatus = 'idle';

  constructor(
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private pagerService: PagerService,
    private fb: FormBuilder) { }

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
      if(budgetFound !== undefined) {
        this.budget = budgetFound;
        this.budgetUsage = this.computeNumberPercent(this.budget.totalDonations, this.authenticationService.currentOrganizationValue.membersRef.length * this.budget.amountPerMember) + "%";
        this.refreshCampaigns(this.campaignPager.page, true);
        this.refreshAccounts(this.accountsPager.page, true);
      }
    });
  }

  refreshCampaigns(page = 1, force = false) {
    if (this.pagerService.canChangePage(this.campaignPager, page) || force) {
      this.campaignsSyncStatus = 'running';
      this.budgetService.getCampaigns(this.selectBudgetForm.controls['budget'].value, page - 1, this.campaignsPageSize)
        .subscribe(response => {
          this.rawProjectsResponse = response;
          this.setCampaignsPage(page);
          const projectIds: number[] = [];
          this.pagedCampaigns.forEach(campaign => {
            if(campaign.project.id > 0) {
              projectIds.push(campaign.project.id);
            }
          });
          this.projectService.getAllByIds(projectIds)
            .subscribe(response => {
              response.forEach(prj => this.projects.set(prj.id, prj))
            },
            error => {
              console.log(error);
            });
          this.campaignsSyncStatus = 'success';
          setTimeout(() => {
            this.campaignsSyncStatus = 'idle';
          }, 1000);
        }, error => {
          this.campaignsSyncStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.campaignsSyncStatus = 'idle';
          }, 1000);
        });
    }
  }

  refreshAccounts(page = 1, force = false) {
    if (this.pagerService.canChangePage(this.accountsPager, page) || force) {
      this.accountsSyncStatus = 'running';
      this.budgetService.getAccounts(this.selectBudgetForm.controls['budget'].value, page - 1, this.accountsPageSize)
        .subscribe(response => {
          this.rawAccountsResponse = response;
          this.setAccountsPage(page);
          const accountUserRef = []
          this.pagedAccounts.forEach(account => accountUserRef.push(account.owner.id));
          this.budgetService.getUsers(this.selectBudgetForm.controls['budget'].value)
            .subscribe(users => {
              this.pagedAccounts.forEach(account => account.setOwner(User.fromModels(users)));
              this.accountsSyncStatus = 'success';
              setTimeout(() => {
                this.accountsSyncStatus = 'idle';
              }, 1000);
            }, error => {
              this.accountsSyncStatus = 'error';
              console.log(error);
              setTimeout(() => {
                this.accountsSyncStatus = 'idle';
              }, 1000);
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
      account.usage = this.computeNumberPercent(account.initialAmount - account.amount, account.initialAmount) + "%";
      this.pagedAccounts.push(account);
    });
  }

  getProject(id: number): ProjectModel {
    let entity = this.projects.get(id);
    if(entity === undefined) {
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
}
