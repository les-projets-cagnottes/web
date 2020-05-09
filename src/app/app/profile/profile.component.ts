import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiTokenService, AuthenticationService, OrganizationService, BudgetService, DonationService, CampaignService, UserService } from 'src/app/_services';
import { ApiToken, DonationModel } from 'src/app/_models';
import { Account, Budget, Campaign, Donation, Organization, User } from 'src/app/_entities';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  accounts: Account[] = [];
  accountsBudgets: Budget[] = [];
  apiTokens: ApiToken[] = [];
  projects: Campaign[] = [];
  user: User = new User();

  // Contributions Tab
  donations: Donation[] = [];
  donationsBudgets: Budget[] = [];
  donationsCampaigns: Budget[] = [];
  deleteDonationsStatus: string[] = [];

  // Settings Tab
  editUserForm = this.fb.group({
    email: ['', [Validators.required, Validators.maxLength(255)]],
    password: [''],
    firstname: ['', [Validators.required, Validators.maxLength(255)]],
    lastname: ['', [Validators.required, Validators.maxLength(255)]],
    avatarUrl: ['', [Validators.required, Validators.maxLength(255)]]
  });
  submitStatus = 'idle';
  submitting = false;

  // Developer Tab
  generateApiTokenStatus = 'idle';
  generatedApiToken: ApiToken = new ApiToken();
  deleteApiTokenStatus: string[] = [];

  // TermsOfUse modal
  modalRef: BsModalRef;

  constructor(
    private apiTokenService: ApiTokenService,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private campaignService: CampaignService,
    private userService: UserService,
    private modalService: BsModalService,
    private fb: FormBuilder) {
    this.user.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.user = User.fromModel(this.authenticationService.currentUserValue);
    this.editUserForm.controls['email'].setValue(this.user.email);
    this.editUserForm.controls['firstname'].setValue(this.user.firstname);
    this.editUserForm.controls['lastname'].setValue(this.user.lastname);
    this.editUserForm.controls['avatarUrl'].setValue(this.user.avatarUrl);
    this.refreshAccounts();
    this.refreshCampaigns();
    this.refreshDonations();
    this.refreshTokens();
  }

  refreshAccounts() {
    this.accounts = [];
    this.userService.getAccounts(this.user.id)
      .subscribe(accounts => {
        var budgetIds = [];
        accounts.forEach(model => {
          var account = Account.fromModel(model);
          account.usage = this.computeNumberPercent(account.amount, account.initialAmount) + "%";
          this.accounts.push(account);
          budgetIds.push(account.budget.id);
        });
        this.budgetService.getAllByIds(budgetIds)
          .subscribe(accountsBudgets => {
            this.accountsBudgets = Budget.fromModels(accountsBudgets);
            var organizationsId = []
            this.accountsBudgets.forEach(budget => organizationsId.push(budget.organization.id));
            this.organizationService.getAllByIds(organizationsId)
              .subscribe(organizations => {
                var tmpOrg = [];
                organizations.forEach(organization => tmpOrg.push(Organization.fromModel(organization)));
                this.accountsBudgets.forEach(budget => budget.setOrganization(tmpOrg));
                this.accounts.forEach(account => account.setBudget(this.accountsBudgets));
              });
          });
      });
  }

  refreshCampaigns() {
    this.userService.getCampaigns(this.user.id)
      .subscribe(campaigns => {
        campaigns.forEach(campaign => this.projects.push(Campaign.fromModel(campaign)));
        var that = this;
        this.projects.forEach(function (value) {
          value.fundingDeadlinePercent = that.computeDatePercent(new Date(value.createdAt), new Date(value.fundingDeadline)) + "%";
          value.peopleRequiredPercent = that.computeNumberPercent(value.peopleGivingTime.length, value.peopleRequired) + "%";
          value.donationsRequiredPercent = that.computeNumberPercent(value.totalDonations, value.donationsRequired) + "%";
        });
      });
  }

  refreshDonations() {
    this.donations = [];
    this.userService.getDonations(this.user.id)
      .subscribe(donations => {
        var budgetIds = [];
        var campaignsId = [];
        donations.forEach(donation => {
          this.donations.push(Donation.fromModel(donation));
          budgetIds.push(donation.budget.id);
          campaignsId.push(donation.campaign.id);
        })
        this.budgetService.getAllByIds(budgetIds)
          .subscribe(budgets => {
            this.donationsBudgets = Budget.fromModels(budgets);
            var organizationsId = []
            this.donationsBudgets.forEach(budget => organizationsId.push(budget.organization.id));
            this.organizationService.getAllByIds(organizationsId)
              .subscribe(organizations => {
                var tmpOrg = [];
                organizations.forEach(organization => tmpOrg.push(Organization.fromModel(organization)));
                this.donationsBudgets.forEach(budget => budget.setOrganization(tmpOrg));
                this.donations.forEach(donation => donation.setBudget(this.donationsBudgets));
              });
          });
        this.campaignService.getAllByIds(campaignsId)
          .subscribe(campaigns => {
              this.donations.forEach(donation => donation.setCampaign(campaigns));
          })
      });
  }

  refreshTokens() {
    this.apiTokens = [];
    this.apiTokenService.getAll()
      .subscribe(apitokens => {
        this.apiTokens = apitokens;
      })
  }

  deleteDonations(donation: Donation) {
    this.donationService.delete(donation.id)
      .subscribe(() => {
        this.refresh();
      },
        error => {
          console.log(error);
          this.deleteDonationsStatus[donation.id] = 'error';
        });
  }

  generateApiToken(template: TemplateRef<any>) {
    this.apiTokenService.generateApiToken()
      .subscribe((apiToken) => {
        this.generatedApiToken = apiToken; 
        this.modalRef = this.modalService.show(template);
        this.refreshTokens();
      },
        error => {
          console.log(error);
          this.generateApiTokenStatus = 'error';
        });
  }

  deleteApiToken(apiToken: ApiToken) {
    this.apiTokenService.delete(apiToken.id)
      .subscribe(() => {
        this.refreshTokens();
      },
      error => {
        console.log(error);
        this.deleteApiTokenStatus[apiToken.id] = 'error';
      });
  }

  submit() {

    // stop here if form is invalid
    if (this.editUserForm.invalid) {
      return;
    }

    // starting submitting
    this.submitting = true;

    var user = new User();
    user.id = this.user.id;
    user.email = this.editUserForm.controls['email'].value;
    user.firstname = this.editUserForm.controls['firstname'].value;
    user.lastname = this.editUserForm.controls['lastname'].value;
    user.avatarUrl = this.editUserForm.controls['avatarUrl'].value;
    if (this.editUserForm.controls['password'].value !== undefined) {
      user.password = this.editUserForm.controls['password'].value;
    }

    this.userService.update(user)
      .subscribe(
        () => {
          this.submitting = false;
          this.submitStatus = 'success';
          setTimeout(() => {
            this.submitStatus = 'idle';
          }, 2000);
        },
        error => {
          console.log(error);
          this.submitStatus = 'error';
          this.submitting = false;
        });

  }

  computeDatePercent(start: Date, deadline: Date) {
    var now = new Date();
    var totalDuration = deadline.getTime() - start.getTime();
    var expiredDuration = now.getTime() - start.getTime();
    return this.computeNumberPercent(expiredDuration, totalDuration);
  }

  computeNumberPercent(number: number, max: number): number {
    if (max == 0) {
      return 100;
    } else if (max < 0) {
      return 100;
    }
    return 100 * number / max;
  }

}