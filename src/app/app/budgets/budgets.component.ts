import { Component, OnInit, TemplateRef } from '@angular/core';
import { BudgetService, AuthenticationService, OrganizationService } from 'src/app/_services';
import { BudgetModel, ContentModel } from 'src/app/_models';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {

  // Data
  rules: Map<number, ContentModel> = new Map<number, ContentModel>();
  budgets: Map<number, BudgetModel> = new Map<number, BudgetModel>();

  // Refresh Status
  refreshStatus = 'idle';

  // Selected Budget
  selectedBudget: BudgetModel = new BudgetModel();

  // Edit Budget Modal
  editBudgetModal: BsModalRef = new BsModalRef();

  // Edit Budget Form
  editBudgetForm: UntypedFormGroup = this.formBuilder.group({
    name: [this.selectedBudget.name, Validators.required],
    amountPerMember: [this.selectedBudget.amountPerMember, [Validators.required, Validators.min(0.01)]],
    startDate: [this.selectedBudget.startDate, Validators.required],
    endDate: [this.selectedBudget.endDate, Validators.required],
    rules: [this.selectedBudget.rules.id, Validators.required]
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private organizationService: OrganizationService
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh(): void {
    this.budgets = new Map<number, BudgetModel>();
    this.organizationService.getBudgets(this.authenticationService.currentOrganizationValue.id)
      .subscribe(budgets => {
        budgets.forEach(budget => {
          this.budgets.set(budget.id, budget);
        });
        this.refreshStatus = 'success';
        setTimeout(() => {
          this.refreshStatus = 'idle';
        }, 2000);
      }, error => {
        this.refreshStatus = 'error';
        setTimeout(() => {
          this.refreshStatus = 'idle';
        }, 2000);
        console.log(error);
      });
  }

  openNewBudgetModal(template: TemplateRef<string>) {
    this.openBudgetModal(template, new BudgetModel());
  }

  openBudgetModal(template: TemplateRef<string>, budget: BudgetModel) {
    this.rules = new Map<number, ContentModel>();
    this.organizationService.getAllContents(this.authenticationService.currentOrganizationValue.id)
      .subscribe(contents => {
        contents.forEach(content => {
          this.rules.set(content.id, content);
        });
        this.editBudgetForm.controls['name'].setValue(budget.name);
        this.editBudgetForm.controls['amountPerMember'].setValue(budget.amountPerMember);
        this.editBudgetForm.controls['startDate'].setValue(this.dateToString(budget.startDate));
        this.editBudgetForm.controls['endDate'].setValue(this.dateToString(budget.endDate));
        if(contents.length > 0) {
          if(budget.rules.id > 0) {
            this.editBudgetForm.controls['rules'].setValue(budget.rules.id);
          } else {
            this.editBudgetForm.controls['rules'].setValue(contents[0].id);
          }
        }
        if(budget.isDistributed) {
          this.editBudgetForm.controls['amountPerMember'].disable();
          this.editBudgetForm.controls['startDate'].disable();
          this.editBudgetForm.controls['endDate'].disable();
          this.editBudgetForm.controls['rules'].disable();
        } else {
          this.editBudgetForm.controls['amountPerMember'].enable();
          this.editBudgetForm.controls['startDate'].enable();
          this.editBudgetForm.controls['endDate'].enable();
          this.editBudgetForm.controls['rules'].enable();
        }
        this.selectedBudget = budget;
        this.editBudgetModal = this.modalService.show(template);
      });
  }

  saveBudget() {

    // Stop here if form is invalid
    if (this.editBudgetForm.invalid) {
      return;
    }

    const budget = new BudgetModel();
    budget.id = this.selectedBudget.id;
    budget.name = this.editBudgetForm.controls['name'].value;
    budget.amountPerMember = this.editBudgetForm.controls['amountPerMember'].value;
    budget.startDate = this.editBudgetForm.controls['startDate'].value;
    budget.endDate = this.editBudgetForm.controls['endDate'].value;
    budget.rules.id = this.editBudgetForm.controls['rules'].value;
    budget.organization.id = this.authenticationService.currentOrganizationValue.id;
    budget.sponsor.id = this.authenticationService.currentUserValue.id;

    if(budget.id == 0) {
      this.budgetService.create(budget)
        .subscribe(() => {
          this.editBudgetModal.hide();
          this.refresh();
        });
    } else {
      this.budgetService.save(budget)
        .subscribe(() => {
          this.editBudgetModal.hide();
          this.refresh();
        });
    }
  }

  distribute(budgetId: number) {
    this.budgetService.distribute(budgetId)
      .subscribe(() => {
        this.refresh();
      });
  }

  delete(budget: BudgetModel) {
    if(!budget.isDistributed) {
      this.budgetService.delete(budget.id)
        .subscribe(() => {
          this.refresh();
        });
    }
  }

  dateToString(date: Date) {
    const dateParsed = new Date(date)
    return dateParsed.getFullYear() + "-" + ("0" + (dateParsed.getMonth() + 1)).slice(-2) + "-" + ("0" + dateParsed.getDate()).slice(-2);
  }

}
