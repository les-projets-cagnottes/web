import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Account, Budget, Campaign, Organization, Project, User } from 'src/app/_entities';
import { ProjectModel } from 'src/app/_models';
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
  budgetUsage: string = "";

  // Form
  selectBudgetForm = this.fb.group({
    budget: [0]
  });

  // Campaigns Box
  private rawProjectsResponse: any;
  campaignPager: any = {};
  pagedCampaigns: Campaign[];
  campaignsPageSize: number = 10;
  campaignsSyncStatus: string = 'idle';

  // Accounts Box
  private rawAccountsResponse: any;
  accountsPager: any = {};
  pagedAccounts: Account[] = [];
  accountsPageSize: number = 10;
  accountsSyncStatus: string = 'idle';

  constructor(
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private userService: UserService,
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
      this.budget = this.budgets.find(budget => budget.id === +val);
      this.budgetUsage = this.computeNumberPercent(this.budget.totalDonations, this.authenticationService.currentOrganizationValue.membersRef.length * this.budget.amountPerMember) + "%";
      this.refreshCampaigns(this.campaignPager.page, true);
      this.refreshAccounts(this.accountsPager.page, true);
    });
  }

  refreshCampaigns(page: number = 1, force: boolean = false) {
    if (this.pagerService.canChangePage(this.campaignPager, page) || force) {
      this.campaignsSyncStatus = 'running';
      this.budgetService.getCampaigns(this.selectBudgetForm.controls['budget'].value, page - 1, this.campaignsPageSize)
        .subscribe(response => {
          this.rawProjectsResponse = response;
          this.setCampaignsPage(page);
          var projectIds = [];
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

  refreshAccounts(page: number = 1, force: boolean = false) {
    if (this.pagerService.canChangePage(this.accountsPager, page) || force) {
      this.accountsSyncStatus = 'running';
      this.budgetService.getAccounts(this.selectBudgetForm.controls['budget'].value, page - 1, this.accountsPageSize)
        .subscribe(response => {
          this.rawAccountsResponse = response;
          this.setAccountsPage(page);
          var accountUserRef = []
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
      var account = Account.fromModel(model);
      account.usage = this.computeNumberPercent(account.initialAmount - account.amount, account.initialAmount) + "%";
      this.pagedAccounts.push(account);
    });
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "0";
    }
    return 100 * number / max;
  }
}
