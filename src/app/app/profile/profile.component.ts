import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ApiTokenService, AuthenticationService, OrganizationService, BudgetService, DonationService, CampaignService, UserService, ProjectService } from 'src/app/_services';
import { ApiToken } from 'src/app/_models';
import { Account, Budget, Campaign, Donation, Organization, Project, User } from 'src/app/_entities';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  accounts: Account[] = [];
  accountsBudgets: Budget[] = [];
  apiTokens: ApiToken[] = [];
  projects: Project[] = [];
  user: User = new User();

  // Contributions Tab
  donations: Donation[] = [];
  donationsBudgets: Budget[] = [];
  donationsCampaigns: Budget[] = [];
  deleteDonationsStatus: string[] = [];

  // Organizations Tab
  organizations: Organization[] = [];
  currentOrganization: Organization = new Organization();
  currentOrganizationSubscription: Subscription;

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
    this.editUserForm.controls['email'].setValue(this.user.email);
    this.editUserForm.controls['firstname'].setValue(this.user.firstname);
    this.editUserForm.controls['lastname'].setValue(this.user.lastname);
    this.editUserForm.controls['avatarUrl'].setValue(this.user.avatarUrl);
    this.refreshAccounts();
    this.refreshProjects();
    this.refreshDonations();
    this.refreshOrganizations();
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

  refreshProjects() {
    this.userService.getProjects(this.user.id)
      .subscribe(projects => {
        projects.forEach(project => this.projects.push(Project.fromModel(project)));
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
            var projectsId = [];
            campaigns.forEach(campaign => projectsId.push(campaign.project.id));
            this.projectService.getAllByIds(projectsId)
              .subscribe(projects => {
                var campaignsProjects = Project.fromModels(projects);
                this.donations.forEach(donation => {
                  donation.setCampaign(campaigns);
                  donation.campaign.setProject(campaignsProjects);
                });
              });
          })
      });
  }

  refreshOrganizations() {
    this.userService.getOrganizations(this.user.id)
      .subscribe(organizations => {
        this.organizations = Organization.fromModels(organizations);
        this.currentOrganization = this.authenticationService.currentOrganizationValue;
        var currentOrganizationIndex = organizations.findIndex(org => org.id === this.currentOrganization.id);
        if(currentOrganizationIndex >= 0) {
          this.organizations[currentOrganizationIndex].isCurrent = true;
        }
      })
  }

  setCurrentOrganization(organization: Organization) {
    this.authenticationService.setCurrentOrganization(organization);
    this.refreshOrganizations();
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