import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, User, Donation, Budget } from 'src/app/_models';
import { AuthenticationService, ProjectService, DonationService, BudgetService, OrganizationService, PagerService } from 'src/app/_services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {

  id: number;
  userLoggedIn: User;
  project: Project = new Project();
  budgets: Budget[] = [];
  donations: Donation[] = [];
  private totalDonations: number;

  modalRef: BsModalRef;
  isUserInTeam: boolean = false;
  donationForm: FormGroup;

  // Pagination
  private rawResponse: any;
  pager: any = {};
  pagedItems: any[];
  pageSize: number = 10;
  
  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private budgetService: BudgetService,
    private organizationService: OrganizationService,
    private projectService: ProjectService,
    private donationService: DonationService,
    private formBuilder: FormBuilder,
    private pagerService: PagerService,
    private modalService: BsModalService) {

    this.route.params.subscribe(params => this.id = params.id);
    this.project.leader = new User();
    this.donationForm = this.formBuilder.group({
      budget: [0],
      amount: [10, [Validators.min(0), Validators.max(0)]]
    });
  }

  ngOnInit() {
    this.refresh();
    this.refreshDonations();
  }

  refresh() {
    this.userLoggedIn = this.authenticationService.currentUserValue;
    if (this.userLoggedIn !== null) {
      this.projectService.getById(this.id)
        .subscribe(response => {
          this.project = response;
          this.project.leader = new User().decode(this.project.leader);
          var remainingTime = Math.abs(new Date(this.project.fundingDeadline).getTime() - new Date().getTime());
          this.project.remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
          this.isUserInTeam = this.project.peopleGivingTime.find(user => {
            return this.userLoggedIn.id === user.id;
          }) !== undefined;
          for(var k = 0 ; k < this.project.peopleGivingTime.length ; k++) {
            this.project.peopleGivingTime[k] = new User().decode(this.project.peopleGivingTime[k]);
          }
        });
      this.organizationService.getByMemberId(this.userLoggedIn.id)
        .subscribe(response => {
          response.forEach(organization => {
            this.budgets = [];
            organization.budgets.forEach(budget => {
              var now = new Date();
              if (budget.isDistributed && new Date(budget.startDate).getTime() <= now.getTime() && now.getTime() <= new Date(budget.endDate).getTime()) {
                budget.organization = organization;
                budget.totalUserDonations = 0;
                this.budgets.push(budget);
              }
            });
          });
          this.budgets.forEach(budget => {
            this.donationService.getByContributorIdAndBudgetId(this.userLoggedIn.id, budget.id)
              .subscribe(donations => {
                donations.forEach(donation => {
                  budget.totalUserDonations += donation.amount;
                });
                this.donationForm.controls.amount.setValidators([Validators.required, Validators.min(0), Validators.max(
                  this.min(budget.amountPerMember - budget.totalUserDonations, this.project.donationsRequired - this.project.totalDonations))]);
              });
          });
        });
    } else {
      this.userLoggedIn = new User();
    }
  }

  refreshDonations(page: number = 1) {
    this.projectService.getDonations(this.id, page - 1, this.pageSize)
      .subscribe(response => {
        this.rawResponse = response;
        this.setPage(page);
      });
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
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
    donation.project = {};
    donation.project.id = this.project.id;
    donation.budget = {};
    donation.budget.id = this.budgets[this.f.budget.value].id;

    this.donationService.create(donation)
      .pipe(first())
      .subscribe(
        () => {
          this.refresh();
          this.refreshDonations();
        },
        error => {
          console.log(error);
        });
  }

  min(val1: number, val2: number): number {
    if(val1 > val2) {
      return val2;
    } else {
      return val1;
    }
  }

}
