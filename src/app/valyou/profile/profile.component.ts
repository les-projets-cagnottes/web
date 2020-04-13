import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiTokenService, AuthenticationService, OrganizationService, BudgetService, DonationService, ProjectService, UserService } from 'src/app/_services';
import { User, Organization, Budget, Donation, Project, ApiToken } from 'src/app/_models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  budgets: Budget[] = [];
  budgetsSorted: Budget[] = [];
  donations: Donation[] = [];
  apiTokens: ApiToken[] = [];
  private organizations: Organization[] = [];
  projects: Project[] = [];
  user: User = new User();
  deleteDonationsStatus: string[] = [];
  deleteApiTokenStatus: string[] = [];

  // Settings tab
  editUserForm = this.fb.group({
    email: ['', [Validators.required, Validators.maxLength(255)]],
    password: [''],
    firstname: ['', [Validators.required, Validators.maxLength(255)]],
    lastname: ['', [Validators.required, Validators.maxLength(255)]],
    avatarUrl: ['', [Validators.required, Validators.maxLength(255)]]
  });
  submitStatus = 'idle';
  submitting = false;

  // Developer tab
  generateApiTokenStatus = 'idle';
  generatedApiToken: ApiToken = new ApiToken();

  // TermsOfUse modal
  modalRef: BsModalRef;

  constructor(
    private apiTokenService: ApiTokenService,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private donationService: DonationService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private userService: UserService,
    private modalService: BsModalService,
    private fb: FormBuilder) {
    this.user.avatarUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.authenticationService.whoami()
      .subscribe(user => {
        this.user.decode(user);
        this.editUserForm.controls['email'].setValue(this.user.email);
        this.editUserForm.controls['firstname'].setValue(this.user.firstname);
        this.editUserForm.controls['lastname'].setValue(this.user.lastname);
        this.editUserForm.controls['avatarUrl'].setValue(this.user.avatarUrl);
        this.organizationService.getByMemberId(this.user.id)
          .subscribe(organizations => {
            this.organizations = organizations;
            var nbBudgetOrgsRetreived = 0;
            this.organizations.forEach(organizationModel => {
              this.organizationService.getById(organizationModel.id)
                .subscribe(organization => {
                  var i = this.organizations.findIndex(org => org.id === organization.id);
                  this.organizations[i] = Organization.decode(organization);
                  this.budgetService.getByOrganizationId(this.organizations[i].id)
                    .subscribe(budgets => {
                      for (var j = 0; j < budgets.length; j++) {
                        budgets[j].totalDonations = 0;
                        budgets[j].organization = this.organizations.find(org => org.id === organization.id);
                        this.budgetsSorted[budgets[j].id] = Budget.decode(budgets[j]);
                      }
                      nbBudgetOrgsRetreived++;
                      if (nbBudgetOrgsRetreived === this.organizations.length) {
                        this.refreshDonations();
                      }
                    });
                });
            })
          });
        this.projectService.getByMemberId(this.user.id)
          .subscribe(projects => {
            this.projects = projects;
            var that = this;
            this.projects.forEach(function (value) {
              value.fundingDeadlinePercent = that.computeDatePercent(new Date(value.createdAt), new Date(value.fundingDeadline)) + "%";
              value.peopleRequiredPercent = that.computeNumberPercent(value.peopleGivingTime.length, value.peopleRequired) + "%";
              value.donationsRequiredPercent = that.computeNumberPercent(value.totalDonations, value.donationsRequired) + "%";
            });
          });
        this.apiTokenService.getAll()
          .subscribe(apitokens => {
            this.apiTokens = apitokens;
          })
      });
  }

  refreshDonations() {
    this.userService.getDonations(this.user.id)
      .subscribe(donations => {
        this.donations = donations;
        this.donations.forEach(donation => { 
          this.deleteDonationsStatus[donation.id] = 'idle'
        });
        this.getProjectForDonations(this.donations, 0);
        for (var k = 0; k < donations.length; k++) {
          var budgetId = donations[k].budget.id;
          this.budgetsSorted[budgetId].donations.push(donations[k]);
          this.budgetsSorted[budgetId].totalDonations += donations[k].amount;
        }
        this.budgets = [];
        for (var k = 0; k < this.budgetsSorted.length; k++) {
          if (this.budgetsSorted[k] != null) {
            this.budgetsSorted[k].remaining = (100 - this.computeNumberPercent(this.budgetsSorted[k].totalDonations, this.budgetsSorted[k].amountPerMember)) + "%";
            this.budgets.push(this.budgetsSorted[k]);
          }
        }
      });
  }

  getProjectForDonations(donations, index) {
    this.projectService.getById(donations[index].project.id)
    .subscribe(response => {
      this.donations[index].project = response;
      if(index < donations.length) {
        this.getProjectForDonations(donations, index + 1);
      }
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
        this.refresh();
      },
        error => {
          console.log(error);
          this.generateApiTokenStatus = 'error';
        });
  }

  deleteApiToken(apiToken: ApiToken) {
    this.apiTokenService.delete(apiToken.id)
      .subscribe(() => {
        this.refresh();
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

    this.userService.updateProfile(user)
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