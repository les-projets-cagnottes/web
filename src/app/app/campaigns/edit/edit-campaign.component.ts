import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';

import { CampaignModel } from 'src/app/_models';
import { Budget, Campaign, Organization, Content } from 'src/app/_entities';
import { AuthenticationService, OrganizationService, CampaignService, BudgetService, UserService, ContentService } from 'src/app/_services';

declare function startSimpleMDE(): any;

@Component({
  selector: 'app-edit-campaign',
  templateUrl: './edit-campaign.component.html',
  styleUrls: ['./edit-campaign.component.css']
})
export class EditCampaignComponent implements OnInit {

  // Data
  id: number = 0;
  private project: Campaign = new Campaign();
  organizations: Organization[] = [];
  budgets: Budget[] = [];
  rules: Content = new Content();
  minDonations: string = "0.00";

  // Form
  form: FormGroup = this.formBuilder.group({
    organization: [0],
    budget: [0],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(255)]],
    fundingDeadline: [''],
    donationsRequired: [0, Validators.required],
    peopleRequired: [2, [Validators.required, Validators.min(2)]],
    rulesCompliant: [false, Validators.pattern("true")]
  });
  submitting: boolean;

  // Funding Deadline field
  now: Date = new Date();
  nowPlus3Months = new Date();
  fundingDeadlineValue = new Date();

  // Long description field
  private simplemde;

  // TermsOfUse modal
  modalRef: BsModalRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private campaignService: CampaignService,
    private contentService: ContentService,
    private organizationService: OrganizationService,
    private userService: UserService
  ) {
    this.route.params.subscribe(params => this.id = params.id);
  }

  ngOnInit() {
    if (this.id > 0) {
      this.campaignService.getById(this.id)
        .subscribe(response => {
          this.project = Campaign.fromModel(response);
          this.refresh();
        });
    } else {
      this.project.longDescription = "# Mon super projet\n## De quoi s'agit-il ?\n## Qui est concerné ?\n## A quoi va servir le budget ?\n## Pourquoi ça me tient à coeur\n"
      this.refresh();
    }
  }

  refresh() {
    this.form.controls['organization'].setValue(0);
    this.form.controls['title'].setValue(this.project.title);
    this.form.controls['shortDescription'].setValue(this.project.shortDescription);
    this.form.controls['fundingDeadline'].setValue(this.dateToString(this.project.fundingDeadline));
    this.form.controls['donationsRequired'].setValue(this.project.donationsRequired);
    this.form.controls['peopleRequired'].setValue(this.project.peopleRequired);

    if (this.id > 0) {
      this.form.controls['fundingDeadline'].disable();
      this.form.controls['donationsRequired'].setValidators([Validators.required, Validators.min(this.project.donationsRequired)]);
      this.minDonations = this.project.donationsRequired.toString();
    }

    this.nowPlus3Months.setMonth(this.now.getMonth() + 3);
    this.fundingDeadlineValue.setMonth(this.now.getMonth() + 1);
    if (typeof startSimpleMDE === 'function') {
      this.simplemde = startSimpleMDE();
      this.simplemde.value(this.project.longDescription);
      this.userService.getOrganizations(this.authenticationService.currentUserValue.id)
        .subscribe(orgs => {
          orgs.forEach(org => this.organizations.push(Organization.fromModel(org)));
          this.form.controls['organization'].setValue(0);
        })
      this.form.controls['organization'].valueChanges.subscribe(val => {
        this.refreshBudgets(this.organizations[val].id);
      });
    }
  }

  refreshBudgets(organizationId: number) {
    this.organizationService.getBudgets(organizationId)
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

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }
    if(this.id == 0 && this.getFundingDeadlineValue().getTime() > this.nowPlus3Months.getTime() ) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    var campaign = new CampaignModel();

    this.project.title = this.f.title.value;
    this.project.shortDescription = this.f.shortDescription.value;
    this.project.donationsRequired = this.f.donationsRequired.value;
    this.project.peopleRequired = this.f.peopleRequired.value;
    this.project.longDescription = this.simplemde.value();
    this.project.organizationsRef = [this.organizations[this.f.organization.value].id];
    this.project.budgetsRef = [this.budgets[this.f.budget.value].id];

    // Submit item to backend
    if (this.id > 0) {
      this.campaignService.update(this.project)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/campaigns/' + response.id]);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      this.project.leader.id = this.authenticationService.currentUserValue.id;
      this.project.fundingDeadline = this.getFundingDeadlineValue()
      this.campaignService.create(this.project)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/campaigns/' + response.id]);
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
