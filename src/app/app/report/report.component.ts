import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Account, Budget, Campaign, Organization, User } from 'src/app/_entities';
import { AuthenticationService, BudgetService, OrganizationService, PagerService, UserService } from 'src/app/_services';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  organizations: Organization[] = [];
  organization: Organization = new Organization();
  budgets: Budget[] = [];
  budget: Budget = new Budget();
  budgetUsage: string = "";
  totalDonations: number[] = [];

  // Form
  selectBudgetForm = this.fb.group({
    organization: [0],
    budget: [0]
  });

  // Campaigns Box
  private rawProjectsResponse: any;
  projectPager: any = {};
  pagedProjects: Campaign[];
  campaignsPageSize: number = 10;

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
    private userService: UserService,
    private pagerService: PagerService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
      .subscribe(organizations => {
        organizations.forEach(organization => this.organizations.push(Organization.fromModel(organization)));
        this.selectBudgetForm.controls['organization'].setValue(this.organizations[0].id);
      });
    this.selectBudgetForm.controls['organization'].valueChanges.subscribe(val => {
      this.organization = this.organizations.find(organization => organization.id === +val);
      this.refreshBudgets(val);
    });
  }

  refreshBudgets(organizationId: number) {
    this.organizationService.getBudgets(organizationId)
      .subscribe(budgets => {
        this.budgets = Budget.fromModels(budgets);
        this.selectBudgetForm.controls['budget'].setValue(this.budgets[0].id);
      });
    this.selectBudgetForm.controls['budget'].valueChanges.subscribe(val => {
      this.budget = this.budgets.find(budget => budget.id === +val);
      this.budgetUsage = this.computeNumberPercent(this.budget.totalDonations, this.organization.membersRef.length * this.budget.amountPerMember) + "%";
      this.refreshCampaigns(this.projectPager.page);
      this.refreshAccounts(this.accountsPager.page);
    });
  }

  refreshCampaigns(page: number = 1) {
    if (this.pagerService.canChangePage(this.projectPager, page)) {
      this.budgetService.getCampaigns(this.selectBudgetForm.controls['budget'].value, page - 1, this.campaignsPageSize)
        .subscribe(response => {
          this.rawProjectsResponse = response;
          this.setCampaignsPage(page);
        });
    }
  }

  refreshAccounts(page: number = 1) {
    if (this.pagerService.canChangePage(this.accountsPager, page)) {
      this.budgetService.getAccounts(this.selectBudgetForm.controls['budget'].value, page - 1, this.accountsPageSize)
        .subscribe(response => {
          this.rawAccountsResponse = response;
          this.setAccountsPage(page);
          var accountUserRef = []
          this.pagedAccounts.forEach(account => accountUserRef.push(account.owner.id));
          this.accountsSyncStatus = 'running';
          this.userService.getAllByIds(accountUserRef)
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
    this.projectPager = this.pagerService.getPager(this.rawProjectsResponse.totalElements, page, this.campaignsPageSize);
    this.pagedProjects = this.rawProjectsResponse.content;
    this.pagedProjects.forEach(project => {
      this.totalDonations[project.id] = 0;
    })
    this.budget.donations.forEach(donation => {
      this.totalDonations[donation.campaign.id] += donation.amount;
    })
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
