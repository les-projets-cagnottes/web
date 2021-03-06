import { Component, OnInit } from '@angular/core';
import { OrganizationService } from 'src/app/_services/organization.service';
import { PagerService, AuthenticationService } from 'src/app/_services';
import { OrganizationModel } from 'src/app/_models';

@Component({
  selector: 'app-organizations',
  templateUrl: './list-organizations.component.html',
  styleUrls: ['./list-organizations.component.css']
})
export class OrganizationsComponent implements OnInit {

  closeResult: string;
  editUserModalLabel: string;
  submitting: boolean;
  refreshStatus: string = "no-refresh";

  private rawResponse: any;
  pager: any = {};
  pagedItems: OrganizationModel[];
  pageSize: number = 10;

  constructor(
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService) { }

  ngOnInit() {
    this.refresh();
  }

  refresh(page: number = 1): void {
    if(this.authenticationService.currentUserValue !== null && this.pagerService.canChangePage(this.pager, page)) {
      this.organizationService.getByOwner(this.authenticationService.currentUserValue, page - 1, this.pageSize)
        .subscribe(response => {
          this.rawResponse = response;
          this.setPage(page);
          this.refreshStatus = 'success';
          setTimeout(() => {
            this.refreshStatus = 'no-refresh';
          }, 2000);
        });
    }
  }

  delete(org: OrganizationModel): void {
    this.organizationService.delete(org.id)
      .subscribe(
        () => {
          this.refresh();
          this.submitting = false;
        },
        error => {
          console.log(error);
          this.submitting = false;
        });
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
  }

}
