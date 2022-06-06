import { Component, OnInit } from '@angular/core';
import { PagerService, OrganizationService } from 'src/app/_services';
import { DataPage, OrganizationModel } from 'src/app/_models';
import { Pager } from 'src/app/_models/pagination/pager/pager';

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

  private rawResponse = new DataPage<OrganizationModel>();
  pager = new Pager();
  pagedItems: OrganizationModel[] = [];
  pageSize = 10;

  constructor(
    private pagerService: PagerService,
    private organizationService: OrganizationService) { }

  ngOnInit() {
    this.refresh();
  }

  refresh(page = 1): void {
    if(this.pagerService.canChangePage(this.pager, page)) {
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

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.rawResponse.totalElements, page, this.pageSize);
    this.pagedItems = this.rawResponse.content;
  }

}
