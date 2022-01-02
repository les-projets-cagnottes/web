import { Component, OnInit } from '@angular/core';
import { BudgetService, AuthenticationService, OrganizationService, UserService, ContentService } from 'src/app/_services';
import { BudgetModel, ContentModel } from 'src/app/_models';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Organization, Budget, Content } from 'src/app/_entities';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private contentService: ContentService,
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
  }

}
