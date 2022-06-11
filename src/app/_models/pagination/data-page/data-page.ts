import { DataSort } from "../data-sort/data-sort";

export class DataPage<Type> {
    content: Type[] = [];
    totalPages = 0;
    totalElements = 0;
    number = 0;
    size = 0;
    numberOfElements = 0;
    sort: DataSort = new DataSort();
}
