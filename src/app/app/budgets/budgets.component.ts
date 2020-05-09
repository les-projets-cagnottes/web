import { Component, OnInit } from '@angular/core';
import { BudgetService, AuthenticationService, OrganizationService } from 'src/app/_services';
import { BudgetModel, Content } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Organization } from 'src/app/_entities';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {

  // Data
  organizations: Organization[];
  contents: Content[];

  // Form
  mainForms: FormGroup[] = [];

  // Buttons states
  addStatus: string = "no-refresh";
  refreshStatus: string = "no-refresh";
  saveStatus: string = "no-refresh";
  distributeStatus: string[][] = [];
  deleteStatus: string[][] = [];

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
    if (this.authenticationService.currentUserValue !== null) {
      this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
        .subscribe(
          response => {
            response.forEach(organization => this.organizations.push(Organization.fromModel(organization)));
            this.mainForms = [];
            var that = this;
            this.organizations.forEach((organization, index) => {
              that.mainForms[index] = that.fb.group({
                budgets: new FormArray([])
              });
              that.deleteStatus[index] = [];
              that.distributeStatus[index] = [];
              organization.budgets.forEach((budget, indexBudget) => {
                budget.usage = that.computeNumberPercent(budget.totalDonations, organization.members.length * budget.amountPerMember) + "%";
                var rulesNumber;
                if(budget.rules == null) {
                  rulesNumber = 0;
                } else {
                  rulesNumber = organization.contents.findIndex(content => content.id == budget.rules.id);
                }
                (that.mainForms[index].controls.budgets as FormArray).push(that.fb.group({
                  id: [budget.id],
                  name: [budget.name, Validators.required],
                  amountPerMember: [{ value: budget.amountPerMember, disabled: budget.isDistributed }, [Validators.required]],
                  startDate: [{ value: this.dateToString(budget.startDate), disabled: budget.isDistributed }, [Validators.required]],
                  endDate: [{ value: this.dateToString(budget.endDate), disabled: budget.isDistributed }, [Validators.required]],
                  rules: [rulesNumber, [Validators.required]],
                  isDistributed: [budget.isDistributed]
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
  }

  save(): void {
    var budgets: BudgetModel[] = [];

    // stop here if form is invalid
    this.organizations.forEach((organization, index) => {
      if (this.mainForms[index].invalid) {
        return;
      }
      (this.mainForms[index].controls.budgets as FormArray).value.forEach(formGroup => {

        var org: any = {};
        org.id = organization.id;
        formGroup.organization = org;
    
        var user: any = {};
        user.id = this.authenticationService.currentUserValue.id;
        formGroup.sponsor = user;

        var content: any = {};
        content.id = organization.contents[formGroup.rules].id;
        formGroup.rules = content;

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

    var budget = new BudgetModel();
    budget.name = "Budget " + new Date().getFullYear();
    budget.startDate = new Date();
    budget.endDate = new Date();
    budget.endDate.setFullYear(budget.startDate.getFullYear() + 1);

    var org: any = {};
    org.id = idOrganization;
    budget.organization = org;

    var user: any = {};
    user.id = this.authenticationService.currentUserValue.id;
    budget.sponsor = user;

    var content = new Content();
    content.id = this.organizations.filter(org => org.id === idOrganization)[0].contents[0].id;
    budget.rules = content;

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
    return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
  }

}
