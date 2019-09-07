import { Component, OnInit } from '@angular/core';
import { AuthenticationService, BudgetService, DonationService, OrganizationService, ProjectService, PagerService, UserService } from 'src/app/_services';
import { Organization, Budget } from 'src/app/_models';
import { FormBuilder } from '@angular/forms';

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

  // Form
  selectBudgetForm = this.fb.group({
    organization: [0],
    budget: [0]
  });

  // Pagination
  private rawProjectsResponse: any;
  projectPager: any = {};
  pagedProjects: any[];
  private rawUsersResponse: any;
  userPager: any = {};
  pagedUsers: any[];
  pageSize: number = 10;
  
  constructor(
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private userService: UserService,
    private pagerService: PagerService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
      .subscribe(organizations => {
        this.organizations = organizations;
        this.selectBudgetForm.controls['organization'].setValue(this.organizations[0].id);
      });
    this.selectBudgetForm.controls['organization'].valueChanges.subscribe(val => {
      this.organization = this.organizations.find(organization => organization.id === +val);
      this.refreshBudgets(val);
    });
  }

  refreshBudgets(organizationId: number) {
    this.budgetService.getByOrganizationId(organizationId)
      .subscribe(budgets => {
        this.budgets = budgets;
        this.selectBudgetForm.controls['budget'].setValue(this.budgets[0].id);
      });
      this.selectBudgetForm.controls['budget'].valueChanges.subscribe(val => {
        this.budget = this.budgets.find(budget => budget.id === +val);
        this.budget.totalDonations = 0;
        this.budget.donations.forEach(element => {
          this.budget.totalDonations += element.amount;
        });;
        this.budget.usage = this.computeNumberPercent(this.budget.totalDonations, this.organization.members.length * this.budget.amountPerMember) + "%";
        this.refreshProjects(this.projectPager.page);
        this.refreshUsers(this.userPager.page);
      });
  }

  refreshProjects(page: number = 1) {
    this.projectService.getByBudgetId(this.selectBudgetForm.controls['budget'].value, page - 1, this.pageSize)
      .subscribe(response => {
        this.rawProjectsResponse = response;
        this.setProjectsPage(page);
      });
  }

  refreshUsers(page: number = 1) {
    this.userService.getByOrganizationId(this.selectBudgetForm.controls['organization'].value, page - 1, this.pageSize)
      .subscribe(response => {
        this.rawUsersResponse = response;
        this.setUsersPage(page);
      });
  }

  setProjectsPage(page: number) {
    this.projectPager = this.pagerService.getPager(this.rawProjectsResponse.totalElements, page, this.pageSize);
    this.pagedProjects = this.rawProjectsResponse.content;
  }

  setUsersPage(page: number) {
    this.userPager = this.pagerService.getPager(this.rawUsersResponse.totalElements, page, this.pageSize);
    this.pagedUsers = this.rawUsersResponse.content;
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "0";
    }
    return 100 * number / max;
  }
}
