import { DataSort } from "../data-sort/data-sort";

export class DataPage {
    content: any[] = [];
    totalPages: number = 0;
    totalElements: number = 0;
    number: number = 0;
    size: number = 0;
    numberOfElements: number = 0;
    sort: DataSort = new DataSort();
}
