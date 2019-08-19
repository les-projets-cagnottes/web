import { Component, OnInit } from '@angular/core';
import { BudgetService, PagerService, AuthenticationService, OrganizationService } from 'src/app/_services';
import { Budget, Organization, User } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {

  // Data
  private organizations: Organization[];

  // Form
  private mainForms: FormGroup[] = [];

  // Buttons states
  private addStatus: string = "no-refresh";
  private refreshStatus: string = "no-refresh";
  private saveStatus: string = "no-refresh";
  private distributeStatus: string[][] = [];
  private deleteStatus: string[][] = [];

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private organizationService: OrganizationService
  ) {
    this.fb.group({
      organizations: this.fb.group({
        budgets: this.fb.array([])
      })
    });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh(): void {
    this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
      .subscribe(
        response => {
          this.organizations = response;
          this.mainForms = [];
          var that = this;
          this.organizations.forEach((organization, index) => {
            that.mainForms[index] = that.fb.group({
              budgets: new FormArray([])
            });
            that.deleteStatus[index] = [];
            that.distributeStatus[index] = [];
            organization.budgets.forEach((budget, indexBudget) => {
              var totalDonations = 0;
              budget.donations.forEach(element => {
                totalDonations += element.amount;
              });;
              budget.usage = that.computeNumberPercent(totalDonations, organization.members.length * budget.amountPerMember) + "%";
              (that.mainForms[index].controls.budgets as FormArray).push(that.fb.group({
                id: [budget.id],
                name: [budget.name, Validators.required],
                amountPerMember: [{ value: budget.amountPerMember, disabled: budget.distributed }, [Validators.required]],
                startDate: [{ value: this.dateToString(budget.startDate), disabled: budget.distributed }, [Validators.required]],
                endDate: [{ value: this.dateToString(budget.endDate), disabled: budget.distributed }, [Validators.required]],
                organization: [budget.organization],
                sponsor: [budget.sponsor],
                donations: [budget.donations]
              }));
              that.deleteStatus[index][indexBudget] = "no-refresh";
              that.distributeStatus[index][indexBudget] = "no-refresh";
            });
            this.refreshStatus = 'success';
            setTimeout(() => {
              this.refreshStatus = 'no-refresh';
            }, 2000);
          });
        },
        error => {
          console.log(error);
          this.refreshStatus = 'error';
          setTimeout(() => {
            this.refreshStatus = 'no-refresh';
          }, 2000);
        });
  }

  save(): void {
    var budgets: Budget[] = [];

    // stop here if form is invalid
    this.organizations.forEach((organization, index) => {
      if (this.mainForms[index].invalid) {
        return;
      }
      (this.mainForms[index].controls.budgets as FormArray).value.forEach(formGroup => {
        console.log(formGroup);
        budgets.push(formGroup);
      });
    });

    this.budgetService.updateAll(budgets)
      .pipe(first())
      .subscribe(
        () => {
          this.saveStatus = 'success';
          this.refresh();
          setTimeout(() => {
            this.saveStatus = 'no-refresh';
          }, 2000);
        },
        error => {
          console.log(error);
          this.saveStatus = 'error';
          setTimeout(() => {
            this.saveStatus = 'no-refresh';
          }, 2000);
        });
  }

  add(idOrganization: number) {

    var budget = new Budget();
    budget.name = "Budget " + new Date().getFullYear();
    budget.startDate = new Date();
    budget.endDate = new Date();
    budget.endDate.setFullYear(budget.startDate.getFullYear() + 1);

    var org = new Organization();
    org.id = idOrganization;
    budget.organization = org;

    var user = new User();
    user.id = this.authenticationService.currentUserValue.id;
    budget.sponsor = user;

    this.budgetService.create(budget)
      .subscribe(
        () => {
          this.addStatus = 'success';
          this.refresh();
          setTimeout(() => {
            this.addStatus = 'no-refresh';
          }, 2000);
        },
        error => {
          console.log(error);
          this.addStatus = 'error';
          setTimeout(() => {
            this.addStatus = 'no-refresh';
          }, 2000);
        });
  }

  distribute(idBudget: number, indexOrg, indexBudget) {
    this.budgetService.distribute(idBudget)
      .subscribe(
        () => {
          this.refresh();
          this.distributeStatus[indexOrg][indexBudget] = 'success';
          setTimeout(() => {
            this.distributeStatus[indexOrg][indexBudget] = 'no-refresh';
          }, 2000);
        },
        error => {
          console.log(error);
          this.distributeStatus[indexOrg][indexBudget] = 'error';
          setTimeout(() => {
            this.distributeStatus[indexOrg][indexBudget] = 'no-refresh';
          }, 2000);
        });
  }

  delete(idBudget: number, indexOrg, indexBudget) {
    this.budgetService.delete(idBudget)
      .subscribe(
        () => {
          this.refresh();
        },
        error => {
          console.log(error);
          this.deleteStatus[indexOrg][indexBudget] = 'error';
          setTimeout(() => {
            this.deleteStatus[indexOrg][indexBudget] = 'no-refresh';
          }, 2000);
        });
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "0";
    }
    return 100 * number / max;
  }

  dateToString(date: Date) {
    var date = new Date(date);
    return date.getFullYear() + "-" + ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
  }

}
