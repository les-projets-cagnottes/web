import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Budget, Donation, Organization, User } from 'src/app/_entities';
import { DonationModel, GenericModel } from 'src/app/_models';
import { AuthenticationService, CampaignService, DonationService, BudgetService, OrganizationService, PagerService, UserService } from 'src/app/_services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Campaign } from 'src/app/_entities/campaign';

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
  accounts: Account[] = [];
  budgets: Budget[] = [];
  organizations: Organization[] = [];
  donations: Donation[] = [];
  members: User[] = [];

  modalRef: BsModalRef;
  isUserInTeam: boolean = false;
  donationForm: FormGroup;

  // Contribute financially
  contributeFinanciallyStatus: string = 'disabled'

  // Donations Box
  private rawResponse: any;
  pager: any = {};
  pagedItems: Donation[] = [];
  pageSize: number = 10;
  donationsSyncStatus: string = 'idle';
  deleteDonationsStatus: string[] = [];

  // Members Box
  membersSyncStatus: string = 'idle';
  
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
    this.donationForm = this.formBuilder.group({
      budget: [0],
      amount: [10, [Validators.min(0), Validators.max(0)]]
    });
  }

  ngOnInit() {
    this.refresh();
    this.refreshAccounts();
    this.refreshDonations();
  }

  refresh() {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    this.campaignService.getById(this.id)
      .subscribe(response => {
        this.project = Campaign.fromModel(response);
        this.refreshLeader();
        this.refreshMembers();
        var remainingTime = Math.abs(new Date(this.project.fundingDeadline).getTime() - new Date().getTime());
        this.project.remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
      });
  }

  refreshLeader() {
    this.userService.getById(this.project.leader.id)
      .subscribe(leader => {
        this.leader = User.fromModel(leader);
      });
  }

  refreshMembers() {
    this.membersSyncStatus = 'running';
    this.userService.getAllByIds(this.project.peopleGivingTimeRef)
    .subscribe(members => {
      this.membersSyncStatus = 'success';
      this.members = User.fromModels(members);
      this.isUserInTeam = this.members.find(user => {
        return this.userLoggedIn.id === user.id;
      }) !== undefined;
      setTimeout(() => {
        this.membersSyncStatus = 'idle';
      }, 1000);
    }, error => {
      this.membersSyncStatus = 'error';
      setTimeout(() => {
        this.membersSyncStatus = 'idle';
      }, 1000);
    });
  }

  refreshAccounts() {
    this.userService.getAccounts(this.userLoggedIn.id)
      .subscribe(accounts => {
        this.accounts = Account.fromModels(accounts);
        this.refreshBudgets();
      })
  }

  refreshBudgets() {
    this.budgetService.getUsable()
      .subscribe(budgets => {
        this.budgets = Budget.fromModels(budgets);
        this.refreshOrganizations();
      });
  }

  refreshOrganizations() {
    var organizationsId = []
    this.budgets.forEach(budget => organizationsId.push(budget.organization.id));
    this.organizationService.getAllByIds(organizationsId)
      .subscribe(organizations => {
        var tmpOrg = [];
        organizations.forEach(organization => tmpOrg.push(Organization.fromModel(organization)));
        this.budgets.forEach(budget => budget.setOrganization(tmpOrg));
        var accounts = this.accounts;
        this.accounts = [];
        accounts.forEach(account => {
          account.setBudget(this.budgets);
          if(account.budget.amountPerMember != 0) {
            this.accounts.push(account);
          }
        });
        this.contributeFinanciallyStatus = 'idle';
        this.donationForm.controls.amount.setValidators([Validators.required, Validators.min(0), Validators.max(
          +(this.min(this.accounts[this.donationForm.controls.budget.value].amount, this.project.donationsRequired - this.project.totalDonations)).toFixed(2))]);  
      });
  }

  refreshDonations(page: number = 1) {
    if(page <= 0) {
      this.donationsSyncStatus = 'success';
      setTimeout(() => {
        this.donationsSyncStatus = 'idle';
      }, 1000);
      return;
    }
    this.donationsSyncStatus = 'running';
    this.campaignService.getDonations(this.id, page - 1, this.pageSize)
      .subscribe(response => {
        this.rawResponse = response;
        this.setPage(page);
        if(this.pagedItems.length == 0) {
          this.donationsSyncStatus = 'success';
        }
        var donationUserRef = []
        this.pagedItems.forEach(donation => donationUserRef.push(donation.contributor.id));
        this.userService.getAllByIds(donationUserRef)
        .subscribe(users => {
          this.pagedItems.forEach(donation => donation.setContributor(users));
          this.donationsSyncStatus = 'success';
          setTimeout(() => {
            this.donationsSyncStatus = 'idle';
          }, 1000);
        }, error => {
          this.donationsSyncStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.donationsSyncStatus = 'idle';
          }, 1000);
        });
      });
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = [];
    this.rawResponse.content.forEach(donation => this.pagedItems.push(Donation.fromModel(donation)));
    this.pagedItems.forEach(donation => { 
      this.deleteDonationsStatus[donation.id] = 'idle'
    });
  }

  deleteDonations(donation: Donation) {
    this.donationService.delete(donation.id)
      .subscribe(() => {
        this.deleteDonationsStatus[donation.id] = 'success';
      },
      error => {
        console.log(error);
        this.deleteDonationsStatus[donation.id] = 'error';
        console.log(error);
        setTimeout(() => {
          this.deleteDonationsStatus[donation.id] = 'idle';
        }, 1000);
      });
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

  get f() { return this.donationForm.controls; }

  onSubmitDonation() {

    if (this.donationForm.invalid) {
      return;
    }

    this.modalRef.hide();

    var donation = new DonationModel();
    donation.amount = this.f.amount.value;
    donation.account = GenericModel.valueOf(this.accounts[this.f.budget.value].id);
    donation.campaign = GenericModel.valueOf(this.project.id);
    donation.budget = GenericModel.valueOf(this.accounts[this.f.budget.value].budget.id);
    donation.contributor = GenericModel.valueOf(this.userLoggedIn.id);

    this.donationService.create(donation)
      .pipe(first())
      .subscribe(
        () => {
          this.modalRef.hide();
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
