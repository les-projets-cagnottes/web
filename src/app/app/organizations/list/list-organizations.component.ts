import { Component, OnInit } from '@angular/core';
import { PagerService, AuthenticationService, OrganizationService } from 'src/app/_services';
import { OrganizationModel } from 'src/app/_models';

@Component({
  selector: 'app-organizations',
  templateUrl: './list-organizations.component.html',
  styleUrls: ['./list-organizations.component.css']
})
export class OrganizationsComponent implements OnInit {

  closeResult = '';
  editUserModalLabel = '';
  submitting = false;
  refreshStatus = "no-refresh";

  private rawResponse: any;
  pager: any = {};
  pagedItems: OrganizationModel[] = [];
  pageSize = 10;

  constructor(
    private pagerService: PagerService,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService) { }

  ngOnInit() {
    this.refresh();
  }

  refresh(page = 1): void {
    if(this.authenticationService.currentUserValue !== null && this.pagerService.canChangePage(this.pager, page)) {
      this.organizationService.list(page - 1, this.pageSize)
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
