import { Component, OnInit } from '@angular/core';
import { AuthenticationService, BudgetService, DonationService, OrganizationService, ProjectService } from 'src/app/_services';
import { Organization, Budget } from 'src/app/_models';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  organizations: Organization[] = [];
  budgets: Budget[] = [];
  organizationForm = this.fb.group({
    organization: [0]
  });

  constructor(
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
      .subscribe(organizations => {
        this.organizations = organizations;
      });
  }

  refreshBudgets(truc) {
    console.log(truc);
    this.budgetService.getByOrganizationId(this.organizations[0].id)
      .subscribe(budgets => {
        this.budgets = budgets;
      });
  }

}
