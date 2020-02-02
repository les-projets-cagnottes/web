import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';

import { Project, Organization, Budget, User } from 'src/app/_models';
import { AuthenticationService, OrganizationService, ProjectService, BudgetService } from 'src/app/_services';

declare function startSimpleMDE(): any;

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css']
})
export class NewProjectComponent implements OnInit {

  // Data
  private id: number = 0;
  private project: Project = new Project();
  organizations: Organization[] = [];
  budgets: Budget[] = [];
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
    private organizationService: OrganizationService,
    private projectService: ProjectService
  ) {
    this.route.params.subscribe(params => this.id = params.id);
  }

  ngOnInit() {
    if (this.id > 0) {
      this.projectService.getById(this.id)
        .subscribe(response => {
          this.project = response;
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
      this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
        .subscribe(orgs => {
          this.organizations = orgs;
          this.form.controls['organization'].setValue(0);
        })
      this.form.controls['organization'].valueChanges.subscribe(val => {
        this.refreshBudgets(this.organizations[val].id);
      });
    }
  }

  refreshBudgets(organizationId: number) {
    this.budgetService.getByOrganizationId(organizationId)
      .subscribe(budgets => {
        this.budgets = budgets;
        this.form.controls['budget'].setValue(0);
      });
  }

  onViewTermsOfUse(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  get f() { return this.form.controls; }

  onSubmit() {

    // If form is invalid, avort
    if (this.form.invalid) {
      return;
    }
    if(this.getFundingDeadlineValue().getTime() > this.nowPlus3Months.getTime() ) {
      return;
    }

    // Set submitting state as true
    this.submitting = true;

    // Get data from form
    var selectedOrganization: any = {};
    selectedOrganization.id = this.organizations[this.f.organization.value].id;
    this.project.organizations = [selectedOrganization];

    var selectedBudget: any = {};
    selectedBudget.id = this.budgets[this.f.budget.value].id;
    this.project.budgets = [selectedBudget];
    
    this.project.title = this.f.title.value;
    this.project.shortDescription = this.f.shortDescription.value;
    this.project.donationsRequired = this.f.donationsRequired.value;
    this.project.peopleRequired = this.f.peopleRequired.value;
    this.project.longDescription = this.simplemde.value();
    
    this.project.leader = new User();
    this.project.leader.id = this.authenticationService.currentUserValue.id;

    // Submit item to backend
    if (this.id > 0) {
      this.project.donations = [];
      this.projectService.update(this.project)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/projects/' + response.id]);
          },
          error => {
            console.log(error);
            this.submitting = false;
          });
    } else {
      this.project.fundingDeadline = this.getFundingDeadlineValue()
      this.projectService.create(this.project)
        .subscribe(
          response => {
            this.submitting = false;
            this.router.navigate(['/projects/' + response.id]);
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
