import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, User, Donation, Budget } from 'src/app/_models';
import { AuthenticationService, ProjectService, DonationService, BudgetService, OrganizationService } from 'src/app/_services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {

  private id: number;
  private userLoggedIn: User;
  private project: Project = new Project();
  private budgets: Budget[] = [];
  private donations: Donation[] = [];
  private totalDonations: number;

  private modalRef: BsModalRef;
  private isUserInTeam: boolean = false;
  private donationForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private donationService: DonationService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService) {

    this.route.params.subscribe(params => this.id = params.id);
    this.project = new Project();
    this.project.leader = new User();
    this.donationForm = this.formBuilder.group({
      budget: [0],
      amount: [10, Validators.required]
    });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    this.projectService.getById(this.id)
      .subscribe(response => {
        this.project = response;
        var remainingTime = Math.abs(new Date(this.project.fundingDeadline).getTime() - new Date().getTime());
        this.project.remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
        this.isUserInTeam = this.project.peopleGivingTime.find(user => {
          return this.userLoggedIn.id === user.id;
        }) !== undefined;
      });
    this.organizationService.getByMemberId(this.authenticationService.currentUserValue.id)
      .subscribe(response => {
        response.forEach(organization => {
          organization.budgets.forEach(budget => {
            var now = new Date();
            if (budget.distributed && new Date(budget.startDate).getTime() <= now.getTime() && now.getTime() <= new Date(budget.endDate).getTime()) {
              budget.organization = organization;
              budget.totalUserDonations = 0;
              this.budgets.push(budget);
            }
          });
        });
        this.budgets.forEach(budget => {
          this.donationService.getByContributorIdAndBudgetId(this.authenticationService.currentUserValue.id, budget.id)
            .subscribe(donations => {
              donations.forEach(donation => {
                console.log(budget.totalUserDonations);
                budget.totalUserDonations += donation.amount;
              });
            });
        });
      });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  computeDatePercent(start: Date, deadline: Date) {
    var now = new Date();
    var totalDuration = deadline.getTime() - start.getTime();
    var expiredDuration = now.getTime() - start.getTime();
    return this.computeNumberPercent(expiredDuration, totalDuration);
  }

  computeNumberPercent(number: number, max: number) {
    if (max == 0) {
      return "100";
    }
    return 100 * number / max;
  }

  join() {
    this.projectService.join(this.id)
      .subscribe(() => {
        this.refresh();
      })
  }

  get f() { return this.donationForm.controls; }

  onSubmitDonation() {

    if (this.donationForm.invalid) {
      return;
    }

    this.modalRef.hide();

    var donation = new Donation();
    donation.amount = this.f.amount.value;
    donation.project = new Project();
    donation.project.id = this.project.id;
    donation.budget = new Budget()
    donation.budget.id = this.budgets[this.f.budget.value].id;

    this.donationService.create(donation)
      .pipe(first())
      .subscribe(
        () => {
          this.refresh();
        },
        error => {
          console.log(error);
        });
  }

}
