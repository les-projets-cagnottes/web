import { Injectable } from '@angular/core';
import { Pager } from 'src/app/_models/pagination/pager/pager';

@Injectable({
    providedIn: 'root'
})
export class PagerService {

    getPager(totalItems: number, currentPage = 1, pageSize = 10): Pager {
        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);
        if(totalItems == 0) totalPages = 1;

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage: number, endPage: number;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        const pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        const pager = new Pager();
        pager.totalItems = totalItems;
        pager.currentPage = currentPage;
        pager.pageSize = pageSize;
        pager.totalPages = totalPages;
        pager.startPage = startPage;
        pager.endPage = endPage;
        pager.startIndex = startIndex;
        pager.endIndex = endIndex;
        pager.pages = pages;

        return pager;
    }

    canChangePage(pager: Pager, newPage: number): boolean {
        return newPage >= pager.startPage && newPage <= pager.endPage;
    }

}
