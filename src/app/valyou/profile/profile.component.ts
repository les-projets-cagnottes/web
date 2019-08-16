import { Component, OnInit } from '@angular/core';
import { AuthenticationService, OrganizationService, BudgetService, DonationService } from 'src/app/_services';
import { User, Organization, Budget, Donation } from 'src/app/_models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private user: User = new User();
  private organizations: Organization[] = [];
  private budgets: Budget[] = [];
  private budgetsSorted: Budget[] = [];
  private donations: Donation[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private donationService: DonationService,
    private organizationService: OrganizationService) {
    this.user.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.authenticationService.whoami()
      .subscribe(user => {
        this.user = user
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
              if(nbBudgetOrgsRetreived === this.organizations.length) {
                this.refreshDonations();
              }
            });
        }
      });
  }

  refreshDonations() {
    this.donationService.getByContributorId(this.authenticationService.currentUserValue.id)
    .subscribe(donations => {
      this.donations = donations;
      for(var k = 0 ; k < donations.length ; k++) {
        var budgetId= <number> <unknown> donations[k].budget;
        this.budgetsSorted[budgetId].donations.push(donations[k]);
        this.budgetsSorted[budgetId].totalDonations+= donations[k].amount;
      }
      for(var k = 0 ; k < this.budgetsSorted.length ; k++) {
        if(this.budgetsSorted[k] != null) {
          this.budgetsSorted[k].totalDonationsPercent = this.computeNumberPercent(this.budgetsSorted[k].totalDonations, this.budgetsSorted[k].amountPerMember) + "%";
          this.budgets.push(this.budgetsSorted[k]);
        }
      }
    });
  }

  computeNumberPercent(number: number, max: number) {
    if(max == 0) {
      return "100";
    }
    return 100 * number / max;
  }

}