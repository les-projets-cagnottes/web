import { AuditModel, GenericModel } from '..';

export class BudgetModel extends AuditModel {
    name: string = '';
    amountPerMember: number = 0;
    isDistributed: boolean = false;
    startDate: Date = new Date();
    endDate: Date = new Date();
    totalDonations: number = 0;
    organization: GenericModel = new GenericModel();
    sponsor: GenericModel = new GenericModel();
    rules: GenericModel = new GenericModel();
    
    // Only in this component
    usage: string = '';
    totalDonationsPercent: string = '';
    remaining: string = '';
}