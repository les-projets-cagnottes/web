import { AuditModel, GenericModel } from '..';

export class BudgetModel extends AuditModel {
    name = '';
    amountPerMember = 0;
    isDistributed = false;
    startDate: Date = new Date();
    endDate: Date = new Date();
    totalDonations = 0;
    organization: GenericModel = new GenericModel();
    sponsor: GenericModel = new GenericModel();
    rules: GenericModel = new GenericModel();
    
    // Only in this component
    usage = '';
    totalDonationsPercent = '';
    remaining = '';
}