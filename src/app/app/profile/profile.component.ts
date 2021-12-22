import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ApiTokenService, AuthenticationService, OrganizationService, BudgetService, DonationService, CampaignService, UserService, ProjectService } from 'src/app/_services';
import { ApiToken, CampaignModel } from 'src/app/_models';
import { Account, Budget, Campaign, Donation, Organization, Project, User } from 'src/app/_entities';
import { AccountService } from 'src/app/_services/account/account.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // Common data
  user: User = new User();
  organization: Organization = new Organization();
  accounts: Map<number, Account> = new Map<number, Account>();
  apiTokens: Map<number, ApiToken> = new Map<number, ApiToken>();
  budgets: Map<number, Budget> = new Map<number, Budget>();
  campaigns: Map<number, Campaign> = new Map<number, Campaign>();
  donations: Map<number, Donation> = new Map<number, Donation>();
  organizations: Map<number, Organization> = new Map<number, Organization>();
  projects: Map<number, Project> = new Map<number, Project>();

  // Project Tab
  userProjects: Project[] = [];

  // Contributions Tab
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
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private campaignService: CampaignService,
    private projectService: ProjectService,
    private userService: UserService,
    private modalService: BsModalService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.user = User.fromModel(this.authenticationService.currentUserValue);
    this.organization = Organization.fromModel(this.authenticationService.currentOrganizationValue);

    this.accounts = new Map<number, Account>();
    this.apiTokens = new Map<number, ApiToken>();
    this.budgets = new Map<number, Budget>();
    this.campaigns = new Map<number, Campaign>();
    this.donations = new Map<number, Donation>();
    this.projects = new Map<number, Project>();
    this.organizations = new Map<number, Organization>();

    this.organizationService.getBudgets(this.organization.id)
      .subscribe(budgetModels => {
        var budgetIds = [];
        budgetModels.forEach(budgetModel => {
          this.budgets.set(budgetModel.id, Budget.fromModel(budgetModel));
          budgetIds.push(budgetModel.id);
        });
        this.userService.getAccountsByBudgetIds(this.user.id, budgetIds)
          .subscribe(accountModels => {
            var accountIds = [];
            accountModels.forEach(accountModel => {
              var account = Account.fromModel(accountModel);
              account.usage = this.computeNumberPercent(account.amount, account.initialAmount) + "%";
              this.accounts.set(accountModel.id, account);
              accountIds.push(accountModel.id);
            });
            this.userService.getDonationsByAccountIds(this.user.id, accountIds)
              .subscribe(donationModels => {
                var campaignIds = [];
                donationModels.forEach(donationModel => {
                  this.donations.set(donationModel.id, Donation.fromModel(donationModel));
                  campaignIds.push(donationModel.campaign.id);
                });
                this.campaignService.getAllByIds(campaignIds)
                  .subscribe(campaignModels => {
                    var projectIds = [];
                    campaignModels.forEach(campaignModel => {
                      this.campaigns.set(campaignModel.id, Campaign.fromModel(campaignModel));
                      projectIds.push(campaignModel.id);
                    });
                    this.projectService.getAllByIds(projectIds)
                      .subscribe(projectModels => {
                        projectModels.forEach(projectModel => {
                          this.projects.set(projectModel.id, Project.fromModel(projectModel))
                        });
                      });
                  });
              });
          });
      });
    this.userService.getProjects(this.user.id)
      .subscribe(projectModels => {
        projectModels.forEach(projectModel => {
          var project = Project.fromModel(projectModel);
          this.projects.set(projectModel.id, project);
          this.userProjects.push(project);
        });
      });
    this.refreshApiTokens();

    // Init Settings form
    this.editUserForm.controls['email'].setValue(this.user.email);
    this.editUserForm.controls['firstname'].setValue(this.user.firstname);
    this.editUserForm.controls['lastname'].setValue(this.user.lastname);
    this.editUserForm.controls['avatarUrl'].setValue(this.user.avatarUrl);
  }

  refreshApiTokens() {
    this.apiTokenService.getAll()
      .subscribe(apiTokenModels => {
        apiTokenModels.forEach(apiTokenModel => {
          this.apiTokens.set(apiTokenModel.id, apiTokenModel);
        });
      });
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
        this.refreshApiTokens();
      },
        error => {
          console.log(error);
          this.generateApiTokenStatus = 'error';
        });
  }

  deleteApiToken(apiToken: ApiToken) {
    this.apiTokenService.delete(apiToken.id)
      .subscribe(() => {
        this.refreshApiTokens();
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