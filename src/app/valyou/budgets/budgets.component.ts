import { Component, OnInit } from '@angular/core';
import { BudgetService, PagerService, AuthenticationService, OrganizationService } from 'src/app/_services';
import { Budget, Organization } from 'src/app/_models';
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
  refreshStatus: string = "no-refresh";
  saveStatus: string = "no-refresh";

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
            organization.budgets.forEach(budget => {
              var totalDonations = 0;
              budget.donations.forEach(element => {
                totalDonations += element.amount;
              });;
              budget.usage = that.computeNumberPercent(totalDonations, organization.members.length * budget.amountPerMember) + "%";
              (that.mainForms[index].controls.budgets as FormArray).push(that.fb.group({
                id: [budget.id],
                name: [budget.name, Validators.required],
                amountPerMember: [budget.amountPerMember, [Validators.required]],
                startDate: [budget.startDate],
                endDate: [budget.endDate],
                organization: [budget.organization],
                sponsor: [budget.sponsor],
                donations: [budget.donations]
              }));
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

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "0";
    }
    return 100 * number / max;
  }

}
