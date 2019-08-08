import { Component, OnInit } from '@angular/core';
import { BudgetService, PagerService } from 'src/app/_services';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {

  // Refreshing state
  refreshStatus: string = "no-refresh";

  // Pagination
  private rawResponse: any;
  pager: any = {};
  pagedItems: any[];
  pageSize: number = 10;

  constructor(
    private pagerService: PagerService,
    private budgetService: BudgetService
    ) { }

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
  
  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
    var that = this;
    this.pagedItems.forEach(function (value) {
      var totalDonations = 0;
      value.donations.forEach(element => {
        totalDonations+= element.amount;
      });;
      value.usage = that.computeNumberPercent(totalDonations, value.organization.members.length * value.amountPerMember) + "%";
    });
  }

  computeNumberPercent(number: number, max: number) {
    if(max == 0) {
      return "100";
    }
    return 100 * number / max;
  }

}
