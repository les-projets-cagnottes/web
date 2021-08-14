import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';

import { CampaignModel } from 'src/app/_models';
import { Budget, Campaign, Content } from 'src/app/_entities';
import { AuthenticationService, OrganizationService, CampaignService, BudgetService, UserService, ContentService } from 'src/app/_services';

@Component({
  selector: 'app-edit-campaign',
  templateUrl: './edit-campaign.component.html',
  styleUrls: ['./edit-campaign.component.css']
})
export class EditCampaignComponent implements OnInit {

  // Data
  id: number = 0;
  idProject: number = 0;
  private campaign: Campaign = new Campaign();
  budgets: Budget[] = [];
  rules: Content = new Content();
  minDonations: string = "0.00";

  // Form
  form: FormGroup = this.formBuilder.group({
    budget: [0],
    fundingDeadline: ['', Validators.pattern("\\d{4}-\\d{2}-\\d{2}")],
    donationsRequired: [0, [Validators.required, Validators.min(0.01)]],
    rulesCompliant: [false, Validators.pattern("true")]
  });
  submitting: boolean;

  // Funding Deadline field
  now: Date = new Date();
  nowPlus3Months = new Date();
  fundingDeadlineValue = new Date();

  // TermsOfUse modal
  modalRef: BsModalRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private authenticationService: AuthenticationService,
    private campaignService: CampaignService,
    private contentService: ContentService,
    private organizationService: OrganizationService
  ) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.idProject = params.idProject;
    });
  }

  ngOnInit() {
    if (this.id > 0) {
      this.campaignService.getById(this.id)
        .subscribe(response => {
          this.campaign = Campaign.fromModel(response);
          this.refresh();
        });
    } else {
      this.refresh();
    }
  }

  refresh() {
    this.form.controls['fundingDeadline'].setValue(this.dateToString(this.campaign.fundingDeadline));
    this.form.controls['donationsRequired'].setValue(this.campaign.donationsRequired);

    if (this.id > 0) {
      this.form.controls['fundingDeadline'].disable();
      this.form.controls['donationsRequired'].setValidators([Validators.required, Validators.min(this.campaign.donationsRequired)]);
      this.minDonations = this.campaign.donationsRequired.toString();
    }

    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    this.refreshBudgets(this.authenticationService.currentOrganizationValue.id);
  }

  refreshBudgets(organizationId: number) {
    this.organizationService.getUsableBudgets(organizationId)
      .subscribe(budgets => {
        this.budgets = Budget.fromModels(budgets);
        this.form.controls['budget'].setValue(0);
      });
  }

  onViewTermsOfUse(template: TemplateRef<any>) {
    this.contentService.getById(this.budgets[this.f.budget.value].rules.id)
      .subscribe(content => {
        this.rules = Content.fromModel(content);
        this.modalRef = this.modalService.show(template);
      });
  }

  get f() { return this.form.controls; }

  onSubmit() {

    console.log(this.form.controls['fundingDeadline'].value)
    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }
    if(this.id == 0 && this.getFundingDeadlineValue().getTime() > this.nowPlus3Months.getTime() ) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    var campaignToSave = new CampaignModel();
    campaignToSave.donationsRequired = this.f.donationsRequired.value;
    campaignToSave.budgetsRef = [this.budgets[this.f.budget.value].id];
    campaignToSave.project.id = this.idProject;

    // Submit item to backend
    if (this.id > 0) {
      campaignToSave.id = this.id
      this.campaignService.update(campaignToSave)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/projects/' + this.idProject]);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      campaignToSave.fundingDeadline = this.getFundingDeadlineValue()
      this.campaignService.create(campaignToSave)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/projects/' + this.idProject]);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    }

  }

  dateToString(date: Date) {
    var date = new Date(date);
    return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
  }

  getFundingDeadlineValue() {
    if(this.form.controls['fundingDeadline'].value == "NaN-aN-aN") {
      return new Date(this.fundingDeadlineValue);
    } else {
      return new Date(this.form.controls['fundingDeadline'].value);
    }
  }

}
