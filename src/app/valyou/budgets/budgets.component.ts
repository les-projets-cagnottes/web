import { Component, OnInit } from '@angular/core';
import { BudgetService, PagerService } from 'src/app/_services';
import { Budget } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {

  // Form
  mainForm: FormGroup;
  get f() { return this.mainForm.controls; }
  get t() { return this.f.budgets as FormArray; }

  // Buttons states
  refreshStatus: string = "no-refresh";
  saveStatus: string = "no-refresh";

  // Pagination
  private rawResponse: any;
  pager: any = {};
  pagedItems: Budget[];
  pageSize: number = 10;

  constructor(
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private budgetService: BudgetService
    ) {
      this.mainForm = this.formBuilder.group({
          budgets: new FormArray([])
      });
    }

  ngOnInit() {
    this.refresh();
  }

  refresh(page: number = 1): void {
    this.budgetService.getAll(page - 1, this.pageSize)
      .subscribe(response => {
        this.rawResponse = response;
        console.log(response);
        this.setPage(page);
        this.refreshStatus = 'success';
        setTimeout(() => {
          this.refreshStatus = 'no-refresh';
        }, 2000);
      });
  }

  save(): void {
    var budgets: Budget[] = [];
    // stop here if form is invalid
    if (this.mainForm.invalid) {
        return;
    }

    this.t.value.forEach(formGroup => {
      budgets.push(formGroup);
    });

    this.budgetService.updateAll(budgets)
    .pipe(first())
    .subscribe(
      () => {
        this.saveStatus = 'success';
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

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
    for (let i = this.t.length; i >= 0; i--) {
        this.t.removeAt(i);
    }
    var that = this;
    this.pagedItems.forEach(function (value) {
      var totalDonations = 0;
      value.donations.forEach(element => {
        totalDonations+= element.amount;
      });;
      value.usage = that.computeNumberPercent(totalDonations, value.organization.members.length * value.amountPerMember) + "%";
      that.t.push(that.formBuilder.group({
          id: [value.id],
          name: [value.name, Validators.required],
          amountPerMember: [value.amountPerMember, [Validators.required]],
          organization: [value.organization],
          sponsor: [value.sponsor],
          donations: [value.donations]
      }));
    });
  }

  computeNumberPercent(number: number, max: number) {
    if(max == 0) {
      return "0";
    }
    return 100 * number / max;
  }

}
