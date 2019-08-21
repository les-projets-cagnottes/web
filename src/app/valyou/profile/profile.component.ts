import { Component, OnInit } from '@angular/core';
import { AuthenticationService, OrganizationService, BudgetService, DonationService, ProjectService } from 'src/app/_services';
import { User, Organization, Budget, Donation, Project } from 'src/app/_models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private budgets: Budget[] = [];
  private budgetsSorted: Budget[] = [];
  private donations: Donation[] = [];
  private organizations: Organization[] = [];
  private projects: Project[] = [];
  private user: User = new User();

  constructor(
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService) {
    this.user.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.authenticationService.whoami()
      .subscribe(user => {
        this.user = user;
      });
    this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
      .subscribe(organizations => {
        this.organizations = organizations;
        var nbBudgetOrgsRetreived = 0;
        for (var i = 0; i < this.organizations.length; i++) {
          this.budgetService.getByOrganizationId(this.organizations[i].id)
            .subscribe(budgets => {
              for (var j = 0; j < budgets.length; j++) {
                budgets[j].totalDonations = 0;
                this.budgetsSorted[budgets[j].id] = budgets[j];
              }
              nbBudgetOrgsRetreived++;
              if (nbBudgetOrgsRetreived === this.organizations.length) {
                this.refreshDonations();
              }
            });
        }
      });
    this.projectService.getByMemberId(this.authenticationService.currentUserValue.id)
      .subscribe(projects => {
        this.projects = projects;
        var that = this;
        this.projects.forEach(function (value) {
          value.fundingDeadlinePercent = that.computeDatePercent(new Date(value.createdAt), new Date(value.fundingDeadline)) + "%";
          value.peopleRequiredPercent = that.computeNumberPercent(value.peopleGivingTime.length, value.peopleRequired) + "%";
          value.donationsRequiredPercent = that.computeNumberPercent(value.totalDonations, value.donationsRequired) + "%";
        });
      });
  }

  refreshDonations() {
    this.donationService.getByContributorId(this.authenticationService.currentUserValue.id)
      .subscribe(donations => {
        this.donations = donations;
        for (var k = 0; k < donations.length; k++) {
          var budgetId = donations[k].budget.id;
          this.budgetsSorted[budgetId].donations.push(donations[k]);
          this.budgetsSorted[budgetId].totalDonations += donations[k].amount;
        }
        for (var k = 0; k < this.budgetsSorted.length; k++) {
          if (this.budgetsSorted[k] != null) {
            this.budgetsSorted[k].totalDonationsPercent = this.computeNumberPercent(this.budgetsSorted[k].totalDonations, this.budgetsSorted[k].amountPerMember) + "%";
            this.budgets.push(this.budgetsSorted[k]);
          }
        }
      });
  }

  computeDatePercent(start: Date, deadline: Date) {
    var now = new Date();
    var totalDuration = deadline.getTime() - start.getTime();
    var expiredDuration = now.getTime() - start.getTime();
    return this.computeNumberPercent(expiredDuration, totalDuration);
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "100";
    } else if(max < 0) {
      return "100";
    }
    return 100 * number / max;
  }

}