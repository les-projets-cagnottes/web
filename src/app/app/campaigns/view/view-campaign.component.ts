import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Campaign, User, Donation, Budget, Generic, Organization } from 'src/app/_models';
import { AuthenticationService, CampaignService, DonationService, BudgetService, OrganizationService, PagerService, UserService } from 'src/app/_services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-view-campaign',
  templateUrl: './view-campaign.component.html',
  styleUrls: ['./view-campaign.component.css']
})
export class ViewCampaignComponent implements OnInit {

  id: number;
  userLoggedIn: User;
  project: Campaign = new Campaign();
  leader: User = new User();
  budgets: Budget[] = [];
  organizations: Organization[] = [];
  donations: Donation[] = [];
  members: User[] = [];
  totalUserDonations: number[] = [];

  modalRef: BsModalRef;
  isUserInTeam: boolean = false;
  donationForm: FormGroup;

  // Contribute financially
  contributeFinanciallyStatus: string = 'get-budgets'

  // Donations
  private rawResponse: any;
  pager: any = {};
  pagedItems: any[];
  pageSize: number = 10;
  donationsSyncStatus: string = 'idle';
  
  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private pagerService: PagerService,
    private campaignService: CampaignService,
    private userService: UserService) {

    this.route.params.subscribe(params => this.id = params.id);
    //this.project.leader = new User();
    this.donationForm = this.formBuilder.group({
      budget: [0],
      amount: [10, [Validators.min(0), Validators.max(0)]]
    });
  }

  ngOnInit() {
    this.refresh();
    this.refreshBudgets();
    this.refreshDonations();
  }

  refresh() {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    this.campaignService.getById(this.id)
      .subscribe(response => {
        this.project = response;
        this.refreshLeader();
        this.refreshMembers();
        var remainingTime = Math.abs(new Date(this.project.fundingDeadline).getTime() - new Date().getTime());
        this.project.remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
      });
  }

  refreshLeader() {
    this.userService.getById(this.project.leader.id)
      .subscribe(leader => {
        this.leader = leader;
      });
  }

  refreshMembers() {
    this.userService.getAllByIds(this.project.peopleGivingTimeRef)
    .subscribe(members => {
      this.members = members;
      this.isUserInTeam = this.members.find(user => {
        return this.userLoggedIn.id === user.id;
      }) !== undefined;
    });
  }

  refreshBudgets() {
    this.budgetService.getUsable()
      .subscribe(budgets => {
        this.budgets = budgets;
        this.contributeFinanciallyStatus = 'idle';
        this.refreshOrganizations();
        this.budgets.forEach(budget => {
          this.totalUserDonations[budget.id] = 0
          this.budgetService.getDonationsByContributorId(this.userLoggedIn.id, budget.id)
          .subscribe(donations => {
            donations.forEach(donation => {
              this.totalUserDonations[donation.budget.id] += donation.amount;
            });
            this.donationForm.controls.amount.setValidators([Validators.required, Validators.min(0), Validators.max(
              +(this.min(budget.amountPerMember - budget.totalUserDonations, this.project.donationsRequired - this.project.totalDonations)).toFixed(2))]);
          });
        })
      });
  }

  refreshOrganizations() {
    var organizationsId = []
    this.budgets.forEach(budget => organizationsId.push(budget.organization.id));
    this.organizationService.getAllByIds(organizationsId)
      .subscribe(organizations => {
        this.budgets.forEach(budget => {
          this.organizations[budget.id] = organizations.find(organization => organization.id === budget.organization.id);
        })
      });
  }

  refreshDonations(page: number = 1) {
    this.donationsSyncStatus = 'running';
    this.campaignService.getDonations(this.id, page - 1, this.pageSize)
      .subscribe(response => {
        this.rawResponse = response;
        this.setPage(page);
        this.pagedItems.forEach(donation => {
          this.donationsSyncStatus = 'running';
          this.userService.getById(donation.contributor.id)
            .subscribe(response => {
              this.donationsSyncStatus = 'success';
              donation.contributor = new User().decode(response);
              setTimeout(() => {
                this.donationsSyncStatus = 'idle';
              }, 1000);
            }
            , error => {
              this.donationsSyncStatus = 'error';
              console.log(error);
              setTimeout(() => {
                this.donationsSyncStatus = 'idle';
              }, 1000);
            }
            );
        })
      });
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
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
    }
    return 100 * number / max;
  }

  join() {
    this.campaignService.join(this.id)
      .subscribe(() => {
        this.refresh();
      })
  }

  onSelectBudgetToContributeFinancially(index) {
    console.log(index);

  }

  get f() { return this.donationForm.controls; }

  onSubmitDonation() {

    if (this.donationForm.invalid) {
      return;
    }

    this.modalRef.hide();

    var donation = new Donation();
    donation.amount = this.f.amount.value;
    donation.project = {};
    donation.project.id = this.project.id;
    donation.budget = {};
    donation.budget.id = this.budgets[this.f.budget.value].id;
    donation.contributor = {};
    donation.contributor.id = this.userLoggedIn.id;

    this.donationService.create(donation)
      .pipe(first())
      .subscribe(
        () => {
          this.refresh();
          this.refreshDonations();
        },
        error => {
          console.log(error);
        });
  }

  min(val1: number, val2: number): number {
    if(val1 > val2) {
      return val2;
    } else {
      return val1;
    }
  }

}
